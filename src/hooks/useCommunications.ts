import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { Communication } from '@/lib/firestore';

export function useCommunications(limitCount?: number, contactId?: string) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'communications'), orderBy('createdAt', 'desc'));
    if (contactId) {
      q = query(collection(db, 'communications'), where('contactId', '==', contactId), orderBy('createdAt', 'desc'));
    }
    if (limitCount) {
      const { limit: limitQuery } = require('firebase/firestore');
      q = query(q, limitQuery(limitCount));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCommunications(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            contactId: data.contactId,
            type: data.type,
            subject: data.subject,
            content: data.content,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          } as Communication;
        })
      );
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [limitCount, contactId]);

  return { communications, isLoading };
} 