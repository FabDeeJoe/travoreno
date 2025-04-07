'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Quote, QuoteStatus } from '@/types/quote';
import { Task } from '@/types/task';
import { Contact, getAllQuotes, getContact, getTask, deleteQuote } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, Trash2 } from 'lucide-react';
import QuoteModal from '@/components/quotes/QuoteModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const STATUS_COLORS: Record<QuoteStatus, string> = {
  draft: 'bg-gray-500',
  sent: 'bg-blue-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
};

const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  rejected: 'Refusé',
};

interface QuoteWithDetails extends Quote {
  contactName?: string;
  taskTitle?: string;
}

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

  const fetchQuoteDetails = async (quote: Quote): Promise<QuoteWithDetails> => {
    try {
      const [contact, task] = await Promise.all([
        getContact(quote.contactId),
        getTask(quote.taskId),
      ]);

      return {
        ...quote,
        contactName: contact?.name,
        taskTitle: task?.title,
      };
    } catch (error) {
      console.error('Error fetching quote details:', error);
      return quote;
    }
  };

  const fetchQuotes = async () => {
    try {
      const fetchedQuotes = await getAllQuotes();
      const quotesWithDetails = await Promise.all(
        fetchedQuotes.map(fetchQuoteDetails)
      );
      setQuotes(quotesWithDetails);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleQuoteClick = async (quote: Quote) => {
    try {
      const [contact, task] = await Promise.all([
        getContact(quote.contactId),
        getTask(quote.taskId),
      ]);

      if (!contact || !task) {
        throw new Error('Contact or task not found');
      }

      setSelectedContact(contact);
      setSelectedTask(task);
      setSelectedQuote(quote);
    } catch (error) {
      console.error('Error fetching quote details:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedQuote(null);
    setSelectedContact(null);
    setSelectedTask(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, quote: Quote) => {
    e.stopPropagation();
    setQuoteToDelete(quote);
  };

  const handleConfirmDelete = async () => {
    if (!quoteToDelete?.id) return;

    try {
      await deleteQuote(quoteToDelete.id);
      toast.success('Devis supprimé avec succès');
      fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Erreur lors de la suppression du devis');
    } finally {
      setQuoteToDelete(null);
    }
  };

  const filteredQuotes = quotes.filter(quote =>
    quote.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Chargement des devis...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Devis</h1>
        <Button onClick={() => router.push('/dashboard/quotes/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau devis
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Rechercher un devis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date du devis</TableHead>
              <TableHead>Date de validité</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Tâche</TableHead>
              <TableHead>Fichier</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  Aucun devis trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotes.map((quote) => (
                <TableRow
                  key={quote.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleQuoteClick(quote)}
                >
                  <TableCell className="font-medium">
                    {quote.reference}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[quote.status]}>
                      {STATUS_LABELS[quote.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(quote.quoteDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {quote.contactName || 'Contact inconnu'}
                  </TableCell>
                  <TableCell>
                    {quote.taskTitle || 'Tâche inconnue'}
                  </TableCell>
                  <TableCell>
                    {quote.fileUrl && (
                      <a
                        href={quote.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FileText className="w-5 h-5" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteClick(e, quote)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedQuote && selectedContact && selectedTask && (
        <QuoteModal
          quote={selectedQuote}
          contact={selectedContact}
          task={selectedTask}
          isOpen={true}
          onClose={handleCloseModal}
          onUpdate={fetchQuotes}
        />
      )}

      <AlertDialog open={!!quoteToDelete} onOpenChange={() => setQuoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce devis ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le devis sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 