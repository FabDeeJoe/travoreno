'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Quote } from '@/types/quote';
import { Task } from '@/types/task';
import { Contact } from '@/lib/firestore';
import { createQuote } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useContacts } from '@/hooks/useContacts';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';
import QuoteForm from '@/components/quotes/QuoteForm';
import { FileUploadStep } from '@/components/quotes/FileUploadStep';

function formatContactName(contact: Contact): string {
  return contact.name;
}

function formatTaskTitle(task: Task): string {
  return `${task.title} (${task.status})`;
}

export default function NewQuotePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [detectedReference, setDetectedReference] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { contacts, isLoading: isLoadingContacts } = useContacts();
  const { tasks, isLoading: isLoadingTasks } = useTasks();

  const selectedContact = contacts?.find(contact => contact.id === selectedContactId);
  const selectedTask = tasks?.find(task => task.id === selectedTaskId);

  const handleFileUploadComplete = (files: File[], reference: string | null) => {
    setSelectedFiles(files);
    setDetectedReference(reference);
    setShowForm(true);
  };

  const handleSubmit = async (quoteData: Partial<Quote>) => {
    if (!selectedContactId || !selectedTaskId) {
      toast.error('Veuillez sélectionner un contact et une tâche');
      return;
    }

    try {
      setIsSubmitting(true);
      await createQuote({
        ...quoteData,
        contactId: selectedContactId,
        taskId: selectedTaskId,
      });
      toast.success('Le devis a été créé avec succès');
      router.push('/dashboard/quotes');
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Une erreur est survenue lors de la création du devis');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingContacts || isLoadingTasks) {
    return <div>Chargement des données...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Nouveau devis</h1>
        
        {!selectedContact || !selectedTask ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tâche</Label>
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une tâche" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : !showForm ? (
          <FileUploadStep
            onComplete={handleFileUploadComplete}
            onCancel={() => {
              setSelectedContactId('');
              setSelectedTaskId('');
            }}
          />
        ) : (
          <QuoteForm
            isSubmitting={isSubmitting}
            contact={selectedContact}
            task={selectedTask}
            onSubmit={handleSubmit}
            initialFiles={selectedFiles}
            initialReference={detectedReference}
          />
        )}
      </div>
    </div>
  );
} 