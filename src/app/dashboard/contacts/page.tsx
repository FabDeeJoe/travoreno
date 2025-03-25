'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getAllContacts, getContactCommunications, type Contact, type Communication } from '@/lib/firestore';
import { Mail, Phone, Calendar, MessageSquare, UserPlus, Search } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NewContactForm } from './new-contact-form';

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

interface ContactDetailsProps {
  contact: Contact;
}

function ContactDetails({ contact }: ContactDetailsProps) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommunications = async () => {
      try {
        const data = await getContactCommunications(contact.id!);
        setCommunications(data);
      } catch (error) {
        console.error('Erreur lors du chargement des communications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunications();
  }, [contact.id]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
          <p className="text-sm">{contact.email || 'Non renseigné'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Téléphone</h3>
          <p className="text-sm">{contact.phone || 'Non renseigné'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Créé le</h3>
          <p className="text-sm">
            {formatDistanceToNow(contact.createdAt, { addSuffix: true, locale: fr })}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Dernière modification</h3>
          <p className="text-sm">
            {formatDistanceToNow(contact.updatedAt, { addSuffix: true, locale: fr })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Communications</h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement des communications...</p>
        ) : communications.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune communication</p>
        ) : (
          <div className="space-y-4">
            {communications.map((comm) => (
              <Card key={comm.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    {TYPE_ICONS[comm.type]}
                    <CardTitle className="text-sm font-medium">
                      {TYPE_LABELS[comm.type]} - {comm.subject}
                    </CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(comm.createdAt, { addSuffix: true, locale: fr })}
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {comm.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await getAllContacts();
        setContacts(data);
        setFilteredContacts(data);
      } catch (error) {
        console.error('Erreur lors du chargement des contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContacts();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query.toLowerCase()) ||
      contact.email?.toLowerCase().includes(query.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredContacts(filtered);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
        <Dialog open={isNewContactDialogOpen} onOpenChange={setIsNewContactDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nouveau contact
            </Button>
          </DialogTrigger>
          <NewContactForm
            onSuccess={() => setIsNewContactDialogOpen(false)}
            onCancel={() => setIsNewContactDialogOpen(false)}
          />
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un contact..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Dernière communication</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Chargement des contacts...
                  </TableCell>
                </TableRow>
              ) : filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {searchQuery ? 'Aucun contact trouvé' : 'Aucun contact enregistré'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.email || '-'}</TableCell>
                    <TableCell>{contact.phone || '-'}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(contact.updatedAt, { addSuffix: true, locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Voir détails
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{contact.name}</DialogTitle>
                          </DialogHeader>
                          <ContactDetails contact={contact} />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 