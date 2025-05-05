'use client';

import { useCommunications } from '@/hooks/useCommunications';
import { useContacts } from '@/hooks/useContacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickCommunicationDialog } from '@/components/QuickCommunicationDialog';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const TYPE_ICONS = {
  email: <Mail className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  other: <MessageSquare className="h-4 w-4" />,
};

const TYPE_LABELS = {
  email: 'Email',
  phone: 'Téléphone',
  meeting: 'Rendez-vous',
  other: 'Autre',
};

export default function CommunicationsPage() {
  const { communications, isLoading } = useCommunications(50);
  const { contacts } = useContacts();

  function getContactName(contactId: string) {
    return contacts.find((c) => c.id === contactId)?.name || '—';
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Communications</h2>
        <QuickCommunicationDialog />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                Chargement des communications...
              </div>
            </CardContent>
          </Card>
        ) : communications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                Aucune communication enregistrée
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Contenu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communications.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell>
                        {formatDistanceToNow(comm.createdAt, { addSuffix: true, locale: fr })}
                      </TableCell>
                      <TableCell>{getContactName(comm.contactId)}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        {TYPE_ICONS[comm.type]}
                        <span>{TYPE_LABELS[comm.type]}</span>
                      </TableCell>
                      <TableCell>{comm.subject}</TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                        {comm.content}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 