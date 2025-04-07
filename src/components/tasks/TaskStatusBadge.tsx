import { TaskStatus } from '@/types/task';
import { Badge } from '@/components/ui/badge';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'done':
        return 'bg-green-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'À faire';
      case 'in_progress':
        return 'En cours';
      case 'done':
        return 'Terminé';
      case 'blocked':
        return 'Bloqué';
      default:
        return status;
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
} 