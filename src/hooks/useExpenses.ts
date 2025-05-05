import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Expense } from '@/lib/firestore';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            amount: data.amount,
            date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
            category: data.category,
            status: data.status || 'pending',
            description: data.description,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          };
        })
      );
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { expenses, isLoading };
} 