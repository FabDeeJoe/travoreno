'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Users, ClipboardList, Receipt } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Contacts',
      value: '0',
      icon: <Users className="w-8 h-8 text-blue-500" />,
      description: 'Professionnels enregistrés',
    },
    {
      title: 'Tâches',
      value: '0',
      icon: <ClipboardList className="w-8 h-8 text-green-500" />,
      description: 'En cours',
    },
    {
      title: 'Dépenses',
      value: '0 €',
      icon: <Receipt className="w-8 h-8 text-purple-500" />,
      description: 'Budget total',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">
        Bonjour, {user?.displayName || 'Bienvenue'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-600">{stat.title}</h3>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold mb-2">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.description}</p>
          </Card>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Tâches récentes</h3>
          <p className="text-gray-500">Aucune tâche pour le moment</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Dernières dépenses</h3>
          <p className="text-gray-500">Aucune dépense pour le moment</p>
        </Card>
      </div>
    </div>
  );
} 