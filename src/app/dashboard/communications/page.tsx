'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickCommunicationDialog } from '@/components/QuickCommunicationDialog';
import { getRecentCommunications, type Communication } from '@/lib/firestore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Mail, Phone, Calendar, MessageSquare } from 'lucide-react';

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
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommunications = async () => {
      try {
        const data = await getRecentCommunications(50); // Charger les 50 dernières communications
        setCommunications(data);
      } catch (error) {
        console.error('Erreur lors du chargement des communications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunications();
  }, []);

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
          communications.map((comm) => (
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
          ))
        )}
      </div>
    </div>
  );
} 