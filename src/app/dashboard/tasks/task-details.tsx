'use client';

import { useState } from 'react';
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
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';
import { updateTask } from '@/lib/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Slider } from '@/components/ui/slider';

const PRIORITY_BADGES = {
  low: { label: 'Faible', variant: 'secondary' as const },
  medium: { label: 'Moyenne', variant: 'default' as const },
  high: { label: 'Haute', variant: 'destructive' as const },
};

const STATUS_BADGES = {
  todo: { label: 'À faire', variant: 'secondary' as const },
  in_progress: { label: 'En cours', variant: 'default' as const },
  done: { label: 'Terminée', variant: 'default' as const },
  blocked: { label: 'Bloquée', variant: 'destructive' as const },
};

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetails({ task, onClose }: TaskDetailsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ...task,
    dueDate: task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateTask(task.id!, {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });

      toast({
        title: 'Tâche mise à jour',
        description: 'La tâche a été mise à jour avec succès.',
      });

      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour de la tâche.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Titre</Label>
          <p className="text-sm">{task.title}</p>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <p className="text-sm whitespace-pre-wrap">{task.description || '-'}</p>
        </div>

        <div className="space-y-2">
          <Label>Priorité</Label>
          <p className="text-sm">{PRIORITY_BADGES[task.priority].label}</p>
        </div>

        <div className="space-y-2">
          <Label>Statut</Label>
          <p className="text-sm">{STATUS_BADGES[task.status].label}</p>
        </div>

        <div className="space-y-2">
          <Label>Progression</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[task.completionPercentage]}
              max={100}
              step={5}
              disabled
            />
            <span className="text-sm text-muted-foreground">
              {task.completionPercentage}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Date d'échéance</Label>
          <p className="text-sm">
            {task.dueDate
              ? format(task.dueDate, 'dd/MM/yyyy', { locale: fr })
              : '-'}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Assigné à</Label>
          <p className="text-sm">{task.assignedTo || '-'}</p>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priorité *</Label>
        <Select
          required
          value={formData.priority}
          onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, priority: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Faible</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="high">Haute</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Statut *</Label>
        <Select
          required
          value={formData.status}
          onValueChange={(value: TaskStatus) => setFormData(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">À faire</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="done">Terminée</SelectItem>
            <SelectItem value="blocked">Bloquée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Progression ({formData.completionPercentage}%)</Label>
        <Slider
          value={[formData.completionPercentage]}
          onValueChange={([value]) => setFormData(prev => ({ ...prev, completionPercentage: value }))}
          max={100}
          step={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Date d'échéance</Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedTo">Assigné à</Label>
        <Input
          id="assignedTo"
          value={formData.assignedTo}
          onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
} 