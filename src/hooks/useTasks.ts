import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Task } from '@/types/task';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[]
      );
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { tasks, isLoading };
} 