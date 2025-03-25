'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createContact, createCommunication, getAllContacts, type Contact } from '@/lib/firestore';
import { MessageSquarePlus, UserPlus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuickCommunicationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactMode, setContactMode] = useState<'new' | 'existing'>('new');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    existingContactId: '',
    type: '',
    subject: '',
    content: ''
  });

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const loadedContacts = await getAllContacts();
        setContacts(loadedContacts);
      } catch (error) {
        console.error('Erreur lors du chargement des contacts:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les contacts existants.',
          variant: 'destructive',
        });
      }
    };

    if (isOpen) {
      loadContacts();
    }
  }, [isOpen, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let contactId: string;

      if (contactMode === 'new') {
        // Créer un nouveau contact
        const contact = await createContact({
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
        });
        contactId = contact.id!;
      } else {
        // Utiliser le contact existant
        contactId = formData.existingContactId;
      }

      // Créer la communication
      await createCommunication({
        contactId,
        type: formData.type as 'email' | 'phone' | 'meeting' | 'other',
        subject: formData.subject,
        content: formData.content,
      });

      toast({
        title: 'Communication enregistrée',
        description: 'La communication a été créée avec succès.',
      });

      setIsOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        existingContactId: '',
        type: '',
        subject: '',
        content: ''
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de la communication.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          Nouvelle communication
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvelle communication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={contactMode === 'new' ? 'default' : 'outline'}
              className={cn(
                'h-24 flex flex-col items-center justify-center space-y-2',
                contactMode === 'new' && 'ring-2 ring-primary'
              )}
              onClick={() => setContactMode('new')}
            >
              <UserPlus className="h-8 w-8" />
              <span>Nouveau contact</span>
            </Button>
            <Button
              type="button"
              variant={contactMode === 'existing' ? 'default' : 'outline'}
              className={cn(
                'h-24 flex flex-col items-center justify-center space-y-2',
                contactMode === 'existing' && 'ring-2 ring-primary'
              )}
              onClick={() => setContactMode('existing')}
            >
              <Users className="h-8 w-8" />
              <span>Contact existant</span>
            </Button>
          </div>

          {contactMode === 'new' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Nom du contact *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="existingContact">Sélectionner un contact *</Label>
              <Select
                value={formData.existingContactId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, existingContactId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id!}>
                      {contact.name} {contact.email ? `(${contact.email})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Type de communication *</Label>
            <Select
              required
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Téléphone</SelectItem>
                <SelectItem value="meeting">Rendez-vous</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Sujet *</Label>
            <Input
              id="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenu *</Label>
            <Textarea
              id="content"
              required
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 