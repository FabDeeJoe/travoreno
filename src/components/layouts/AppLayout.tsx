'use client';

import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { 
  Users, 
  ClipboardList, 
  Receipt, 
  LogOut,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
}

const DEFAULT_MENU_ITEMS = [
  {
    title: 'Accueil',
    icon: <Home className="w-5 h-5" />,
    href: '/dashboard',
  },
  {
    title: 'Contacts',
    icon: <Users className="w-5 h-5" />,
    href: '/dashboard/contacts',
  },
  {
    title: 'Tâches',
    icon: <ClipboardList className="w-5 h-5" />,
    href: '/dashboard/tasks',
  },
  {
    title: 'Dépenses',
    icon: <Receipt className="w-5 h-5" />,
    href: '/dashboard/expenses',
  },
] as const;

export function AppLayout({ children, header, sidebar }: AppLayoutProps) {
  const { user, logout } = useAuth();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Fixed structure */}
      <aside className="w-64 bg-white shadow-md">
        <div className="flex flex-col h-full">
          {/* App branding - Fixed */}
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">TravoReno</h2>
            <p className="text-sm text-gray-500 mt-1">
              {user.displayName || user.email}
            </p>
          </div>

          {/* Custom sidebar content if provided */}
          {sidebar || (
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {DEFAULT_MENU_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Logout button - Fixed */}
          <div className="p-4 border-t mt-auto">
            <button
              onClick={() => logout()}
              className="flex items-center w-full p-2 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Se déconnecter</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header area - Optional but fixed structure */}
        {header && (
          <header className="bg-white shadow-sm">
            <div className="px-8 py-4">
              {header}
            </div>
          </header>
        )}

        {/* Main content - Scrollable */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 