import { Quote } from '@/types/quote';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import QuoteForm from './QuoteForm';
import { getTask, getContact } from '@/lib/firestore';
import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { Contact } from '@/lib/firestore';
import { toast } from 'sonner';

interface NewQuoteModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Quote>) => Promise<void>;
}

export default function NewQuoteModal({
  taskId,
  isOpen,
  onClose,
  onSubmit,
}: NewQuoteModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedTask = await getTask(taskId);
        if (!fetchedTask) {
          toast.error('Tâche non trouvée');
          onClose();
          return;
        }

        if (!fetchedTask.assignedTo) {
          toast.error('Aucun contact assigné à cette tâche');
          onClose();
          return;
        }

        const fetchedContact = await getContact(fetchedTask.assignedTo);
        if (!fetchedContact) {
          toast.error('Contact non trouvé');
          onClose();
          return;
        }

        setTask(fetchedTask);
        setContact(fetchedContact);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erreur lors du chargement des données');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [taskId, isOpen, onClose]);

  if (!isOpen || isLoading || !task || !contact) {
    return null;
  }

  const handleSubmit = async (data: Partial<Quote>) => {
    await onSubmit({
      ...data,
      taskId,
      contactId: contact.id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau devis</DialogTitle>
        </DialogHeader>
        <QuoteForm
          task={task}
          contact={contact}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
} 