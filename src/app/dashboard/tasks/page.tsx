'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getAllTasks } from '@/lib/firestore';
import { Task } from '@/types/task';
import { PlusCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NewTaskForm } from './new-task-form';
import { TaskDetails } from './task-details';
import { Progress } from '@/components/ui/progress';
import { useTasks } from '@/hooks/useTasks';

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

export default function TasksPage() {
  const { tasks, isLoading } = useTasks();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);

  useEffect(() => {
    const filtered = tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTasks(filtered);
  }, [tasks, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tâches</h2>
        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle tâche</DialogTitle>
            </DialogHeader>
            <NewTaskForm onSuccess={() => setIsNewTaskDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Rechercher des tâches..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Date d'échéance</TableHead>
                <TableHead>Assigné à</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Chargement des tâches...
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {searchQuery ? 'Aucune tâche trouvée' : 'Aucune tâche enregistrée'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedTask(task)}
                  >
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Badge variant={PRIORITY_BADGES[task.priority].variant}>
                        {PRIORITY_BADGES[task.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGES[task.status].variant}>
                        {STATUS_BADGES[task.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={task.completionPercentage} className="w-[60%]" />
                        <span className="text-sm text-muted-foreground">
                          {task.completionPercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.dueDate
                        ? (() => {
                            let dateObj: Date;
                            if (typeof task.dueDate === 'string' || typeof task.dueDate === 'number') {
                              dateObj = new Date(task.dueDate);
                            } else if (task.dueDate instanceof Date) {
                              dateObj = task.dueDate;
                            } else if (task.dueDate && typeof (task.dueDate as any).toDate === 'function') {
                              // Cas Firestore Timestamp
                              dateObj = (task.dueDate as any).toDate();
                            } else {
                              return '-';
                            }
                            return isNaN(dateObj.getTime())
                              ? '-'
                              : format(dateObj, 'dd/MM/yyyy', { locale: fr });
                          })()
                        : '-'}
                    </TableCell>
                    <TableCell>{task.assignedTo || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de la tâche</DialogTitle>
            </DialogHeader>
            <TaskDetails task={selectedTask} onClose={() => setSelectedTask(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 