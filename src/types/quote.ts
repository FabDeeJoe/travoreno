export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface Quote {
  id?: string;
  reference: string;
  taskId: string;
  contactId: string;
  status: QuoteStatus;
  notes?: string;
  quoteDate: Date;
  validUntil?: Date;
  receivedAt?: Date;
  files?: Array<{ fileUrl: string; fileName: string }>;
  createdAt: Date;
  updatedAt: Date;
} 