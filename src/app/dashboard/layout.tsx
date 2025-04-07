'use client';

import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageSquare, Users, ClipboardList, Receipt, LogOut, FileText } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6">
        <nav className="space-y-4">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Accueil</span>
          </Link>
          <Link
            href="/dashboard/communications"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Communications</span>
          </Link>
          <Link
            href="/dashboard/contacts"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <Users className="h-5 w-5" />
            <span>Contacts</span>
          </Link>
          <Link
            href="/dashboard/tasks"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ClipboardList className="h-5 w-5" />
            <span>Tâches</span>
          </Link>
          <Link
            href="/dashboard/quotes"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <FileText className="h-5 w-5" />
            <span>Devis</span>
          </Link>
          <Link
            href="/dashboard/expenses"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <Receipt className="h-5 w-5" />
            <span>Dépenses</span>
          </Link>
          <button
            onClick={() => logout()}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-background">
        {children}
      </div>
    </div>
  );
} 