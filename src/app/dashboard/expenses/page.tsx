'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getAllExpenses, type Expense } from '@/lib/firestore';
import { PlusCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NewExpenseForm } from './new-expense-form';
import { useExpenses } from '@/hooks/useExpenses';

const EXPENSE_CATEGORIES = {
  transport: 'Transport',
  accommodation: 'Hébergement',
  food: 'Restauration',
  equipment: 'Équipement',
  other: 'Autre',
};

const PAYMENT_STATUS = {
  pending: { label: 'En attente', variant: 'secondary' as const },
  estimated: { label: 'Estimé', variant: 'outline' as const },
  settled: { label: 'Réglé', variant: 'default' as const },
};

export default function ExpensesPage() {
  const { expenses, isLoading } = useExpenses();
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewExpenseDialogOpen, setIsNewExpenseDialogOpen] = useState(false);

  useEffect(() => {
    setFilteredExpenses(expenses);
  }, [expenses]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = expenses.filter((expense) =>
      expense.description?.toLowerCase().includes(query.toLowerCase()) ||
      EXPENSE_CATEGORIES[expense.category].toLowerCase().includes(query.toLowerCase()) ||
      PAYMENT_STATUS[expense.status].label.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredExpenses(filtered);
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const settledAmount = filteredExpenses
    .filter(expense => expense.status === 'settled')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const pendingAmount = filteredExpenses
    .filter(expense => expense.status === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dépenses</h2>
        <Dialog open={isNewExpenseDialogOpen} onOpenChange={setIsNewExpenseDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvelle dépense
            </Button>
          </DialogTrigger>
          <NewExpenseForm
            onSuccess={() => setIsNewExpenseDialogOpen(false)}
            onCancel={() => setIsNewExpenseDialogOpen(false)}
          />
        </Dialog>
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une dépense..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex space-x-2">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium">Total réglé</div>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(settledAmount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium">En attente</div>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(pendingAmount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium">Total</div>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(totalAmount)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Chargement des dépenses...
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {searchQuery ? 'Aucune dépense trouvée' : 'Aucune dépense enregistrée'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {format(expense.date, 'PPP', { locale: fr })}
                    </TableCell>
                    <TableCell>{EXPENSE_CATEGORIES[expense.category]}</TableCell>
                    <TableCell>{expense.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={PAYMENT_STATUS[expense.status].variant}>
                        {PAYMENT_STATUS[expense.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(expense.amount)}
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