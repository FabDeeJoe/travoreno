import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit as limitQuery, Timestamp, serverTimestamp, FieldValue, getDoc, doc } from 'firebase/firestore';

export interface Contact {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Communication {
  id?: string;
  contactId: string;
  type: 'email' | 'phone' | 'meeting' | 'other';
  subject: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'equipment' | 'other';
export type PaymentStatus = 'pending' | 'estimated' | 'settled';

export interface Expense {
  id?: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  status: PaymentStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = serverTimestamp();
  
  // Créer un objet avec uniquement les champs non-undefined
  const contactData: Record<string, any> = {
    name: contact.name,
    createdAt: now,
    updatedAt: now,
  };

  // Ajouter les champs optionnels seulement s'ils ont une valeur
  if (contact.email) {
    contactData.email = contact.email;
  }
  if (contact.phone) {
    contactData.phone = contact.phone;
  }
  
  try {
    const docRef = await addDoc(collection(db, 'contacts'), contactData);
    return { 
      id: docRef.id, 
      ...contactData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Erreur lors de la création du contact:', error);
    throw error;
  }
}

export async function createCommunication(communication: Omit<Communication, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = serverTimestamp();
  const communicationData = {
    ...communication,
    createdAt: now,
    updatedAt: now,
  };
  
  try {
    const docRef = await addDoc(collection(db, 'communications'), communicationData);
    return { 
      id: docRef.id, 
      ...communication,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Erreur lors de la création de la communication:', error);
    throw error;
  }
}

export async function getRecentCommunications(limitCount = 5) {
  const q = query(
    collection(db, 'communications'),
    orderBy('createdAt', 'desc'),
    limitQuery(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }) as Communication[];
}

export async function getContactCommunications(contactId: string) {
  const q = query(
    collection(db, 'communications'),
    where('contactId', '==', contactId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }) as Communication[];
}

export async function getAllContacts() {
  const q = query(
    collection(db, 'contacts'),
    orderBy('name', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }) as Contact[];
}

export async function createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = serverTimestamp();
    const expenseData = {
      ...expense,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'expenses'), expenseData);
    return {
      id: docRef.id,
      ...expense,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
}

export async function getAllExpenses(): Promise<Expense[]> {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'expenses'), orderBy('date', 'desc'))
    );

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        amount: data.amount,
        date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        category: data.category,
        status: data.status || 'pending',
        description: data.description,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      };
    });
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
} 