'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createExpense, type ExpenseCategory, type PaymentStatus } from '@/lib/firestore';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const EXPENSE_CATEGORIES = [
  { id: 'transport', label: 'Transport' },
  { id: 'accommodation', label: 'Hébergement' },
  { id: 'food', label: 'Restauration' },
  { id: 'equipment', label: 'Équipement' },
  { id: 'other', label: 'Autre' },
];

const PAYMENT_STATUS = [
  { id: 'pending', label: 'En attente' },
  { id: 'estimated', label: 'Estimé' },
  { id: 'settled', label: 'Réglé' },
];

interface NewExpenseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NewExpenseForm({ onSuccess, onCancel }: NewExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const category = formData.get('category') as ExpenseCategory;
    const status = formData.get('status') as PaymentStatus;
    const description = formData.get('description') as string;

    try {
      await createExpense({
        amount,
        date,
        category,
        status,
        description,
      });

      toast({
        title: 'Dépense créée',
        description: 'La dépense a été créée avec succès.',
      });

      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de la création de la dépense:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de la dépense.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Nouvelle dépense</DialogTitle>
        <DialogDescription>
          Ajoutez une nouvelle dépense en remplissant le formulaire ci-dessous.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Montant (€) *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label>Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: fr }) : 'Sélectionner une date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                value={date}
                onChange={(date) => date && setDate(date as Date)}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Catégorie *</Label>
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Statut du paiement *</Label>
          <Select name="status" required defaultValue="pending">
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUS.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Description de la dépense..."
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
            {isLoading ? 'Création...' : 'Créer la dépense'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
} 