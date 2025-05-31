// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  console.log('HomePage - Estado:', {
    isAuthenticated,
    isLoading,
    hasRedirected
  });

  useEffect(() => {
    // Aguardar o contexto de auth terminar de carregar
    if (isLoading || hasRedirected) return;

    // Definir flag para evitar múltiplos redirecionamentos
    setHasRedirected(true);

    // Pequeno delay para garantir que o estado está estável
    const timer = setTimeout(() => {
      console.log('setTimeout');
      
      if (isAuthenticated) {
        console.log('🏠 HomePage: Usuário autenticado, redirecionando para dashboard');
        router.push('/dashboard');
      } else {
        console.log('🏠 HomePage: Usuário não autenticado, redirecionando para login');
        router.push('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, hasRedirected, router]);

  // Mostrar loading enquanto determina o redirecionamento
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Verificando autenticação...' : 'Redirecionando...'}
        </p>
      </div>
    </div>
  );
}