export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  createdAt: Date;
}

export interface Communication {
  id: string;
  contactId: string;
  taskId?: string;
  type: 'email' | 'phone' | 'meeting' | 'other';
  subject: string;
  content: string;
  date: Date;
  createdAt: Date;
} 