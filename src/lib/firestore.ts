import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit as limitQuery, Timestamp, serverTimestamp, FieldValue, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { Quote, QuoteStatus } from '@/types/quote';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
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

export async function getAllTasks(): Promise<Task[]> {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))
    );

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        completionPercentage: data.completionPercentage || 0,
        dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : data.dueDate ? new Date(data.dueDate) : undefined,
        assignedTo: data.assignedTo,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      };
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function updateTask(taskId: string, task: Partial<Task>): Promise<void> {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...task,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

export async function createQuote(data: Partial<Quote>): Promise<string> {
  try {
    const now = new Date();
    const quoteData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'quotes'), quoteData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating quote:', error);
    throw error;
  }
}

export async function getQuote(id: string): Promise<Quote | null> {
  try {
    const docRef = doc(db, 'quotes', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
      } as Quote;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting quote:', error);
    throw error;
  }
}

export async function updateQuote(id: string, data: Partial<Quote>): Promise<void> {
  try {
    const docRef = doc(db, 'quotes', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    throw error;
  }
}

export async function deleteQuote(quoteId: string): Promise<void> {
  try {
    const quoteRef = doc(db, 'quotes', quoteId);
    await deleteDoc(quoteRef);
  } catch (error) {
    console.error('Error deleting quote:', error);
    throw error;
  }
}

export async function getAllQuotes(): Promise<Quote[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'quotes'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Quote));
  } catch (error) {
    console.error('Error getting all quotes:', error);
    throw error;
  }
}

export async function getQuotesByTask(taskId: string): Promise<Quote[]> {
  try {
    const q = query(collection(db, 'quotes'), where('taskId', '==', taskId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Quote));
  } catch (error) {
    console.error('Error getting quotes by task:', error);
    throw error;
  }
}

export async function getTask(id: string): Promise<Task | null> {
  try {
    const docRef = doc(db, 'tasks', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
      } as Task;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting task:', error);
    throw error;
  }
}

export async function getContact(id: string): Promise<Contact | null> {
  try {
    const docRef = doc(db, 'contacts', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
      } as Contact;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting contact:', error);
    throw error;
  }
} 