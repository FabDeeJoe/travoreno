'use client';

import { Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Communication } from '@/lib/firestore';

const TYPE_ICONS = {
  email: <Mail className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  other: <MessageSquare className="h-4 w-4" />,
};

interface Stage {
  id: string;
  title: string;
  description: string;
}

interface KanbanBoardProps {
  stages: Stage[];
  items: Record<string, Communication[]>;
  isLoading: boolean;
  onItemClick: (communication: Communication) => void;
}

export function KanbanBoard({ stages, items, isLoading, onItemClick }: KanbanBoardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {stages.map((stage) => (
          <Card key={stage.id} className="h-[calc(100vh-16rem)]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{stage.title}</span>
                <Badge variant="secondary">...</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Chargement...
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {stages.map((stage) => (
        <Card key={stage.id} className="h-[calc(100vh-16rem)]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{stage.title}</span>
              <Badge variant="secondary">{items[stage.id]?.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-22rem)]">
              <div className="space-y-4">
                {items[stage.id]?.map((communication) => (
                  <Card
                    key={communication.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onItemClick(communication)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        {TYPE_ICONS[communication.type]}
                        <span className="text-sm font-medium">{communication.subject}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {communication.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(communication.createdAt, {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!items[stage.id] || items[stage.id].length === 0) && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    Aucune communication
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 