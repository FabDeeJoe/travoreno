'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuoteForm from '@/components/quotes/QuoteForm';
import { getQuote, updateQuote, getTask, getContact, Contact } from '@/lib/firestore';
import { Quote } from '@/types/quote';
import { Task } from '@/types/task';
import { toast } from '@/components/ui/use-toast';

interface EditQuotePageProps {
  params: {
    id: string;
  };
}

export default function EditQuotePage({ params }: EditQuotePageProps) {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedQuote = await getQuote(params.id);
        if (!fetchedQuote) {
          toast({
            title: 'Erreur',
            description: 'Le devis demandé n\'existe pas.',
            variant: 'destructive',
          });
          router.push('/dashboard/quotes');
          return;
        }

        const [fetchedTask, fetchedContact] = await Promise.all([
          getTask(fetchedQuote.taskId),
          getContact(fetchedQuote.contactId),
        ]);

        if (!fetchedTask || !fetchedContact) {
          toast({
            title: 'Erreur',
            description: 'La tâche ou le contact associé n\'existe pas.',
            variant: 'destructive',
          });
          router.push('/dashboard/quotes');
          return;
        }

        setQuote(fetchedQuote);
        setTask(fetchedTask);
        setContact(fetchedContact);
      } catch (error) {
        console.error('Error fetching quote data:', error);
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la récupération des données.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleSubmit = async (data: Partial<Quote>) => {
    try {
      setIsSubmitting(true);
      await updateQuote(params.id, data);
      toast({
        title: 'Devis mis à jour',
        description: 'Le devis a été mis à jour avec succès.',
      });
      router.push('/dashboard/quotes');
    } catch (error) {
      console.error('Error updating quote:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du devis.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Chargement du devis...</div>;
  }

  if (!quote || !task || !contact) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Modifier le devis</h1>
        <QuoteForm
          quote={quote}
          task={task}
          contact={contact}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
} 