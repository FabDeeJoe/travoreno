'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';
import { redirect } from 'next/navigation';

export default function Home() {
  const { user } = useAuth();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Bienvenue sur TravoReno
        </h1>
        <p className="text-center text-lg mb-8">
          Votre assistant personnel pour la gestion de vos projets de rénovation
        </p>

        <AuthForm />
      </div>
    </main>
  );
} 