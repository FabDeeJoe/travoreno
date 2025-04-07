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
import { createTask } from '@/lib/firestore';
import { Slider } from '@/components/ui/slider';

interface NewTaskFormProps {
  onSuccess: () => void;
}

export function NewTaskForm({ onSuccess }: NewTaskFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    status: 'todo' as TaskStatus,
    completionPercentage: 0,
    dueDate: '',
    assignedTo: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createTask({
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });

      toast({
        title: 'Tâche créée',
        description: 'La tâche a été créée avec succès.',
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de la tâche.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Création...' : 'Créer'}
        </Button>
      </div>
    </form>
  );
} 