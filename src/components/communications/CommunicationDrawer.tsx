'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useContacts } from '@/hooks/useContacts';
import { useTasks } from '@/hooks/useTasks';
import { Communication, createCommunication, updateCommunication } from '@/lib/firestore';

const COMMUNICATION_TYPES = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Téléphone' },
  { id: 'meeting', label: 'Rendez-vous' },
  { id: 'other', label: 'Autre' },
] as const;

const COMMUNICATION_STATUS = [
  { id: 'draft', label: 'Brouillon' },
  { id: 'pending', label: 'À envoyer' },
  { id: 'sent', label: 'Envoyé' },
  { id: 'completed', label: 'Terminé' },
] as const;

interface CommunicationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communication?: Communication | null;
  onSuccess?: () => void;
}

export function CommunicationDrawer({
  open,
  onOpenChange,
  communication,
  onSuccess,
}: CommunicationDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { contacts } = useContacts();
  const { tasks } = useTasks();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get('type') as Communication['type'],
      subject: formData.get('subject') as string,
      content: formData.get('content') as string,
      contactId: formData.get('contactId') as string,
      taskId: formData.get('taskId') as string || undefined,
      status: formData.get('status') as Communication['status'],
    };

    try {
      if (communication) {
        await updateCommunication(communication.id, data);
        toast({
          title: 'Communication mise à jour',
          description: 'La communication a été mise à jour avec succès.',
        });
      } else {
        await createCommunication(data);
        toast({
          title: 'Communication créée',
          description: 'La communication a été créée avec succès.',
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la communication:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde de la communication.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {communication ? 'Modifier la communication' : 'Nouvelle communication'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              name="type"
              defaultValue={communication?.type || 'email'}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut *</Label>
            <Select
              name="status"
              defaultValue={communication?.status || 'draft'}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_STATUS.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Sujet *</Label>
            <Input
              id="subject"
              name="subject"
              defaultValue={communication?.subject}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenu *</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={communication?.content}
              required
              disabled={isLoading}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactId">Contact *</Label>
            <Select name="contactId" defaultValue={communication?.contactId} required>
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
            <Label htmlFor="taskId">Tâche associée</Label>
            <Select name="taskId" defaultValue={communication?.taskId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une tâche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucune tâche</SelectItem>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Enregistrement...'
                : communication
                ? 'Mettre à jour'
                : 'Créer'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
} 