// src/app/dashboard/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, selectedTenant } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🔒 DashboardLayout - Estado da autenticação:', {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      selectedTenant
    });

    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('🚫 Não autenticado, redirecionando para login...');
        router.push('/login');
        return;
      }
      
      if (!selectedTenant) {
        console.log('🏢 Sem tenant selecionado, redirecionando para login...');
        router.push('/login');
        return;
      }
      
      console.log('✅ Acesso autorizado ao dashboard');
    }
  }, [isAuthenticated, isLoading, selectedTenant, router]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
          {selectedTenant && (
            <p className="text-xs text-muted-foreground">Tenant: {selectedTenant}</p>
          )}
        </div>
      </div>
    );
  }

  // Se não autenticado, não renderizar nada (redirecionamento acontecerá)
  if (!isAuthenticated || !selectedTenant) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}