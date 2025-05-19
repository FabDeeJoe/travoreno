'use client';

import { useState, useEffect } from 'react';
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
import { Communication } from '@/types/communication';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const TYPE_ICONS = {
  email: <Mail className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  other: <MessageSquare className="h-4 w-4" />,
};

const TYPE_LABELS = {
  email: 'Email',
  phone: 'Téléphone',
  meeting: 'Rendez-vous',
  other: 'Autre',
};

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
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [formData, setFormData] = useState({
    ...task,
    dueDate: task.dueDate
      ? (() => {
          let dateObj: Date;
          if (typeof task.dueDate === 'string' || typeof task.dueDate === 'number') {
            dateObj = new Date(task.dueDate);
          } else if (task.dueDate instanceof Date) {
            dateObj = task.dueDate;
          } else if (task.dueDate && typeof (task.dueDate as any).toDate === 'function') {
            dateObj = (task.dueDate as any).toDate();
          } else {
            return '';
          }
          return isNaN(dateObj.getTime()) ? '' : format(dateObj, 'yyyy-MM-dd');
        })()
      : '',
  });

  useEffect(() => {
    if (task.id) {
      const q = query(
        collection(db, 'communications'),
        where('taskId', '==', task.id)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const comms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Communication[];
        setCommunications(comms);
      });

      return () => unsubscribe();
    }
  }, [task.id]);

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

  if (isEditing) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{task.title}</h2>
        <Button onClick={() => setIsEditing(true)}>Modifier</Button>
      </div>

      <div className="grid gap-4">
        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-muted-foreground">{task.description || 'Aucune description'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Priorité</h3>
            <Badge variant={PRIORITY_BADGES[task.priority].variant}>
              {PRIORITY_BADGES[task.priority].label}
            </Badge>
          </div>

          <div>
            <h3 className="font-medium mb-2">Statut</h3>
            <Badge variant={STATUS_BADGES[task.status].variant}>
              {STATUS_BADGES[task.status].label}
            </Badge>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Progression</h3>
          <div className="flex items-center gap-2">
            <Progress value={task.completionPercentage} className="w-[60%]" />
            <span className="text-sm text-muted-foreground">
              {task.completionPercentage}%
            </span>
          </div>
        </div>

        {task.dueDate && (
          <div>
            <h3 className="font-medium mb-2">Date d'échéance</h3>
            <p className="text-muted-foreground">
              {format(new Date(task.dueDate), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        )}

        {task.assignedTo && (
          <div>
            <h3 className="font-medium mb-2">Assigné à</h3>
            <p className="text-muted-foreground">{task.assignedTo}</p>
          </div>
        )}

        <div className="pt-4">
          <h3 className="font-medium mb-4">Communications associées</h3>
          {communications.length === 0 ? (
            <p className="text-muted-foreground">Aucune communication associée</p>
          ) : (
            <div className="space-y-4">
              {communications.map((comm) => (
                <Card key={comm.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      {TYPE_ICONS[comm.type]}
                      <CardTitle className="text-sm font-medium">
                        {TYPE_LABELS[comm.type]} - {comm.subject}
                      </CardTitle>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comm.createdAt), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {comm.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 