import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Contact } from '@/types/contact';

function parseFirestoreDate(value: any): Date {
  if (!value) return new Date(0);
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }
  if (typeof value?.toDate === 'function') {
    const d = value.toDate();
    return isNaN(d.getTime()) ? new Date(0) : d;
  }
  return new Date(0);
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'contacts'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContacts(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            notes: data.notes,
            createdAt: parseFirestoreDate(data.createdAt),
            updatedAt: parseFirestoreDate(data.updatedAt),
          } as Contact;
        })
      );
      setIsLoading(false);
    }, (err) => {
      setError(err instanceof Error ? err : new Error('Failed to fetch contacts'));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { contacts, isLoading, error };
} 