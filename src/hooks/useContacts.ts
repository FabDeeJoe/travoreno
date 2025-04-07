import { useState, useEffect } from 'react';
import { getAllContacts } from '@/lib/firestore';
import { Contact } from '@/types/contact';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const fetchedContacts = await getAllContacts();
        setContacts(fetchedContacts);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch contacts'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return { contacts, isLoading, error };
} 