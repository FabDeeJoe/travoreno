import { useState, useEffect } from 'react';
import { getAllTasks } from '@/lib/firestore';
import { Task } from '@/types/task';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getAllTasks();
        setTasks(fetchedTasks);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return { tasks, isLoading, error };
} 