'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const authSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  displayName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp, updateUserProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      setError('');
      if (isSignUp) {
        await signUp(data.email, data.password);
        if (data.displayName) {
          await updateUserProfile(data.displayName);
        }
      } else {
        await signIn(data.email, data.password);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'authentification');
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isSignUp ? 'Créer un compte' : 'Se connecter'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isSignUp && (
          <div>
            <Input
              {...register('displayName')}
              placeholder="Nom complet"
              className="w-full"
            />
            {errors.displayName && (
              <p className="text-destructive text-sm mt-1">{errors.displayName.message}</p>
            )}
          </div>
        )}

        <div>
          <Input
            {...register('email')}
            type="email"
            placeholder="Email"
            className="w-full"
          />
          {errors.email && (
            <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Input
            {...register('password')}
            type="password"
            placeholder="Mot de passe"
            className="w-full"
          />
          {errors.password && (
            <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Chargement...' : isSignUp ? 'S\'inscrire' : 'Se connecter'}
        </Button>
      </form>

      <p className="text-center mt-4">
        {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-primary hover:underline"
        >
          {isSignUp ? 'Se connecter' : 'S\'inscrire'}
        </button>
      </p>
    </div>
  );
} 