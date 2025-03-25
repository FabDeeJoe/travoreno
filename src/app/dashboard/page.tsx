'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickCommunicationDialog } from '@/components/QuickCommunicationDialog';
import { Users, ClipboardList, Receipt, Phone, Mail, DollarSign, Calendar, MessageSquare } from 'lucide-react';
import { getRecentCommunications, type Communication } from '@/lib/firestore';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [recentCommunications, setRecentCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommunications = async () => {
      try {
        const data = await getRecentCommunications(5);
        setRecentCommunications(data);
      } catch (error) {
        console.error('Erreur lors du chargement des communications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunications();
  }, []);

  const stats = [
    {
      title: 'Contacts',
      value: '0',
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
      value: '0',
      icon: <ClipboardList className="w-8 h-8 text-purple-500" />,
      description: 'En cours',
    },
    {
      title: 'Dépenses',
      value: '0 €',
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
              <p className="text-sm text-muted-foreground">
                Chargement des communications...
              </p>
            ) : recentCommunications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune communication récente
              </p>
            ) : (
              <div className="space-y-4">
                {recentCommunications.map((comm) => (
                  <div key={comm.id} className="flex items-start space-x-3">
                    {TYPE_ICONS[comm.type]}
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {TYPE_LABELS[comm.type]} - {comm.subject}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {comm.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comm.createdAt, { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tâches en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aucune tâche en cours
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 