'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createContact } from '@/lib/firestore';

interface NewContactFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NewContactForm({ onSuccess, onCancel }: NewContactFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    try {
      await createContact({
        name,
        email,
        phone: phone || undefined,
      });

      toast({
        title: 'Contact créé',
        description: 'Le contact a été créé avec succès.',
      });

      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de la création du contact:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création du contact.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Nouveau contact</DialogTitle>
        <DialogDescription>
          Créez un nouveau contact en remplissant le formulaire ci-dessous.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom *</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="John Doe"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john.doe@example.com"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            disabled={isLoading}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Création...' : 'Créer le contact'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
} 