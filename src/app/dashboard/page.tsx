'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickCommunicationDialog } from '@/components/communications/QuickCommunicationDialog';
import { Users, ClipboardList, Receipt, Phone, Mail, DollarSign, Calendar, MessageSquare } from 'lucide-react';
import { getRecentCommunications, type Communication } from '@/lib/firestore';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCommunications } from '@/hooks/useCommunications';
import { useContacts } from '@/hooks/useContacts';
import { useTasks } from '@/hooks/useTasks';
import { useExpenses } from '@/hooks/useExpenses';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

export default function DashboardPage() {
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { tasks } = useTasks();
  const { expenses } = useExpenses();
  const { communications: recentCommunications, isLoading } = useCommunications(5);

  const ongoingOrBlockedTasks = tasks.filter(task => task.status === 'in_progress' || task.status === 'blocked');
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  function getContactName(contactId: string) {
    return contacts.find((c) => c.id === contactId)?.name || '—';
  }

  const stats = [
    {
      title: 'Contacts',
      value: contacts.length.toString(),
      icon: <Users className="w-8 h-8 text-blue-500" />,
      description: 'Professionnels enregistrés',
    },
    {
      title: 'Communications',
      value: recentCommunications.length.toString(),
      icon: <MessageSquare className="w-8 h-8 text-green-500" />,
      description: 'Communications totales',
    },
    {
      title: 'Tâches',
      value: tasks.length.toString(),
      icon: <ClipboardList className="w-8 h-8 text-purple-500" />,
      description: 'En cours',
    },
    {
      title: 'Dépenses',
      value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalExpenses),
      icon: <DollarSign className="w-8 h-8 text-yellow-500" />,
      description: 'Budget total',
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <QuickCommunicationDialog />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Communications récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Chargement des communications...</p>
            ) : recentCommunications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune communication récente</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recentCommunications.map((comm) => (
                  <Card key={comm.id} className="p-3 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {TYPE_ICONS[comm.type]}
                      <span className="font-medium text-sm truncate">{TYPE_LABELS[comm.type]} - {comm.subject}</span>
                      <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(comm.createdAt, { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {comm.content}
                    </div>
                    <div className="text-xs text-muted-foreground italic">
                      {getContactName(comm.contactId)}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tâches en cours / bloquées</CardTitle>
          </CardHeader>
          <CardContent>
            {ongoingOrBlockedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune tâche en cours ou bloquée</p>
            ) : (
              <ul className="space-y-2">
                {ongoingOrBlockedTasks.map((task) => (
                  <li key={task.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{task.title}</span>
                      <Badge variant={task.status === 'in_progress' ? 'default' : task.status === 'blocked' ? 'destructive' : 'secondary'}>
                        {task.status === 'in_progress' ? 'En cours' : task.status === 'blocked' ? 'Bloquée' : task.status}
                      </Badge>
                      <span className="ml-2 text-xs text-muted-foreground">{task.completionPercentage}%</span>
                    </div>
                    <Progress value={task.completionPercentage} className="w-full h-2 my-1" />
                    <span className="text-xs text-muted-foreground">{task.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 