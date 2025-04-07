import { Quote } from '@/types/quote';
import { Task } from '@/types/task';
import { Contact } from '@/lib/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import QuoteForm from './QuoteForm';
import { updateQuote } from '@/lib/firestore';
import { toast } from 'sonner';

interface QuoteModalProps {
  quote: Quote;
  contact: Contact;
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function QuoteModal({
  quote,
  contact,
  task,
  isOpen,
  onClose,
  onUpdate,
}: QuoteModalProps) {
  const handleSubmit = async (data: Partial<Quote>) => {
    try {
      await updateQuote(quote.id!, data);
      toast.success('Devis mis à jour avec succès');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Erreur lors de la mise à jour du devis');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le devis {quote.reference}</DialogTitle>
        </DialogHeader>
        <QuoteForm
          quote={quote}
          contact={contact}
          task={task}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
} 