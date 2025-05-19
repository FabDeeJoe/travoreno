'use client';

import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCommunications } from '@/hooks/useCommunications';
import { CommunicationDrawer } from '@/components/communications/CommunicationDrawer';
import { KanbanBoard } from '@/components/communications/KanbanBoard';
import { useState } from 'react';

const COMMUNICATION_STAGES = [
  {
    id: 'draft',
    title: 'Brouillons',
    description: 'Communications en cours de rédaction',
  },
  {
    id: 'pending',
    title: 'À envoyer',
    description: 'Communications prêtes à être envoyées',
  },
  {
    id: 'sent',
    title: 'Envoyées',
    description: 'Communications envoyées au client',
  },
  {
    id: 'completed',
    title: 'Terminées',
    description: 'Communications archivées',
  },
];

export default function CommunicationsPage() {
  const { communications, isLoading, mutate } = useCommunications(50);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState(null);

  const communicationsByStage = useMemo(() => {
    return COMMUNICATION_STAGES.reduce((acc, stage) => {
      acc[stage.id] = communications.filter(comm => comm.status === stage.id);
      return acc;
    }, {});
  }, [communications]);

  const handleNewCommunication = () => {
    setSelectedCommunication(null);
    setIsDrawerOpen(true);
  };

  const handleCommunicationClick = (communication) => {
    setSelectedCommunication(communication);
    setIsDrawerOpen(true);
  };

  return (
    <div className="h-full flex flex-col space-y-4 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communications</h2>
          <p className="text-muted-foreground">
            Gérez vos communications avec vos clients
          </p>
        </div>
        <Button onClick={handleNewCommunication}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle communication
        </Button>
      </div>

      <KanbanBoard
        stages={COMMUNICATION_STAGES}
        items={communicationsByStage}
        isLoading={isLoading}
        onItemClick={handleCommunicationClick}
      />

      <CommunicationDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        communication={selectedCommunication}
        onSuccess={() => {
          setIsDrawerOpen(false);
          mutate();
        }}
      />
    </div>
  );
} 