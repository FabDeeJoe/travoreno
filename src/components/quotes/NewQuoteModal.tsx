import { Quote } from '@/types/quote';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import QuoteForm from './QuoteForm';
import { FileUploadStep } from './FileUploadStep';
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

export default function NewQuoteModal({ taskId, isOpen, onClose, onSubmit }: NewQuoteModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [detectedReference, setDetectedReference] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const taskData = await getTask(taskId);
        if (!taskData) throw new Error('Task not found');
        
        const contactData = await getContact(taskData.assignedTo || '');
        if (!contactData) throw new Error('Contact not found');

        setTask(taskData);
        setContact(contactData);
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

  const handleFileUploadComplete = (files: File[], reference: string | null) => {
    setSelectedFiles(files);
    setDetectedReference(reference);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Partial<Quote>) => {
    try {
      if (!task || !contact) return;

      // Si une référence a été détectée et qu'aucune n'a été fournie dans le formulaire,
      // utiliser la référence détectée
      const finalData = {
        ...data,
        taskId,
        contactId: contact.id,
        reference: data.reference || detectedReference || '',
      };
      await onSubmit(finalData);
      
      // Réinitialiser l'état
      setSelectedFiles([]);
      setDetectedReference(null);
      setShowForm(false);
      onClose();
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error('Erreur lors de la création du devis');
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nouveau devis</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div>Chargement...</div>
        ) : !showForm ? (
          <FileUploadStep
            onComplete={handleFileUploadComplete}
            onCancel={onClose}
          />
        ) : task && contact ? (
          <QuoteForm
            task={task}
            contact={contact}
            onSubmit={handleFormSubmit}
            initialFiles={selectedFiles}
            initialReference={detectedReference}
          />
        ) : (
          <div>Erreur: Données manquantes</div>
        )}
      </DialogContent>
    </Dialog>
  );
} 