// src/app/login/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TenantSelector } from '@/components/auth/TenantSelector';
import { LoginDemoInfo } from '@/components/auth/LoginDemoInfo';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2, AlertCircle, Building2, ArrowLeft, Bug } from 'lucide-react';

interface TenantInfo {
  id: string;
  nome: string;
  subdomain: string;
  codigo: string;
  cidade?: string;
  estado?: string;
}

export default function LoginPage() {
  const [step, setStep] = useState<'tenant' | 'login'>('tenant');
  const [selectedTenant, setSelectedTenant] = useState<TenantInfo | null>(null);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectionAttempted, setRedirectionAttempted] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [showDebug, setShowDebug] = useState(process.env.NODE_ENV === 'development');
  
  const { login, isAuthenticated, setTenant, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Função para forçar redirecionamento de múltiplas formas
  const forceRedirect = useCallback(() => {
    console.log('🚀 Forçando redirecionamento - tentativa:', redirectAttempts + 1);
    
    setRedirectAttempts(prev => prev + 1);
    
    if (redirectAttempts === 0) {
      // Tentativa 1: router.push()
      console.log('📍 Tentativa 1: router.push()');
      router.push('/dashboard');
    } else if (redirectAttempts === 1) {
      // Tentativa 2: router.replace()
      console.log('📍 Tentativa 2: router.replace()');
      router.replace('/dashboard');
    } else if (redirectAttempts >= 2) {
      // Tentativa 3: window.location (força refresh)
      console.log('📍 Tentativa 3: window.location.href');
      window.location.href = '/dashboard';
    }
  }, [router, redirectAttempts]);

  // Verificar autenticação e redirecionar
  useEffect(() => {
    if (authLoading) return;

    console.log('🔍 LoginPage - Verificando estado:', {
      isAuthenticated,
      authLoading,
      redirectionAttempted,
      redirectAttempts
    });

    if (isAuthenticated && !redirectionAttempted) {
      console.log('✅ Usuário autenticado - iniciando redirecionamento');
      setRedirectionAttempted(true);
      
      // Primeiro redirecionamento imediato
      forceRedirect();
    }
  }, [isAuthenticated, authLoading, redirectionAttempted, forceRedirect]);

  // Auto-retry redirecionamento se não funcionou
  useEffect(() => {
    if (isAuthenticated && redirectionAttempted && redirectAttempts < 3) {
      const timer = setTimeout(() => {
        console.log('⏰ Retry redirecionamento após 2s');
        forceRedirect();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, redirectionAttempted, redirectAttempts, forceRedirect]);

  // Reset quando não autenticado
  useEffect(() => {
    if (!isAuthenticated && redirectionAttempted) {
      setRedirectionAttempted(false);
      setRedirectAttempts(0);
    }
  }, [isAuthenticated, redirectionAttempted]);

  const handleTenantSelect = (tenant: TenantInfo) => {
    console.log('🏢 Tenant selecionado:', tenant);
    setTenant(tenant.subdomain);
    setSelectedTenant(tenant);
    setError('');
    setStep('login');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTenant) {
      setError('Selecione um município primeiro');
      setStep('tenant');
      return;
    }

    if (!usuario.trim() || !senha.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 LoginPage: Tentando fazer login...');
      await login({ usuario: usuario.trim(), senha });
      window.location.reload();
      console.log('✅ LoginPage: Login realizado com sucesso');
    } catch (error) {
      console.error('❌ LoginPage: Erro no login:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
      setIsLoading(false);
    }
  };

  const handleBackToTenant = () => {
    setStep('tenant');
    setSelectedTenant(null);
    setError('');
  };

  const handleCredentialSelect = (usuario: string, senha: string) => {
    setUsuario(usuario);
    setSenha(senha);
  };

  const handleManualRedirect = () => {
    console.log('👆 Redirecionamento manual clicado');
    window.location.href = '/dashboard';
  };

  // Se está carregando auth inicial
  if (authLoading && !redirectionAttempted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se já autenticado - tela de redirecionamento
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">
            Redirecionando para dashboard...
          </p>
          
          {/* Informações de Debug */}
          {showDebug && (
            <div className="space-y-3 text-left">
              <div className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded border">
                <strong>Debug Info:</strong>
                <pre className="whitespace-pre-wrap">
{JSON.stringify({
  isAuthenticated,
  authLoading,
  redirectionAttempted,
  redirectAttempts,
  currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR'
}, null, 2)}
                </pre>
              </div>
              
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={forceRedirect}
                  className="w-full"
                >
                  🔄 Tentar Redirecionamento ({redirectAttempts + 1}/3)
                </Button>
                
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={handleManualRedirect}
                  className="w-full"
                >
                  🚀 Forçar Redirecionamento Manual
                </Button>
                
                <Button 
                  size="sm" 
                  //variant="destructive"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full"
                >
                  🗑️ Limpar Cache e Recarregar
                </Button>
              </div>
            </div>
          )}
          
          {/* Fallback após múltiplas tentativas */}
          {redirectAttempts >= 3 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                Redirecionamento automático falhou. Clique no botão abaixo:
              </p>
              <Button onClick={handleManualRedirect} className="w-full">
                Ir para Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Renderizar seletor de tenant
  if (step === 'tenant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Building2 className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Sistema de Gestão de Saúde</h1>
            <p className="text-sm text-muted-foreground">
              Selecione seu município para continuar
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <TenantSelector 
            onTenantSelect={handleTenantSelect}
            selectedTenant={selectedTenant}
          />

          {process.env.NODE_ENV === 'development' && (
            <LoginDemoInfo 
              selectedTenant={selectedTenant?.subdomain}
              onCredentialSelect={handleCredentialSelect}
            />
          )}
        </div>
      </div>
    );
  }

  // Renderizar formulário de login
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {selectedTenant && (
          <div className="text-center space-y-2">
            <Building2 className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-xl font-bold">{selectedTenant.nome}</h1>
            <p className="text-sm text-muted-foreground">
              Sistema de Gestão de Saúde
            </p>
          </div>
        )}

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToTenant}
                className="p-0 h-auto"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">Entrar no Sistema</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Digite suas credenciais para acessar
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-accent/50 border border-border rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{selectedTenant?.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    Código: {selectedTenant?.codigo}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToTenant}
                >
                  Alterar
                </Button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="usuario" className="text-sm font-medium">
                  Usuário
                </label>
                <input
                  id="usuario"
                  type="text"
                  placeholder="Digite seu nome de usuário"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="senha" className="text-sm font-medium">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
                {isLoading || authLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isLoading ? 'Entrando...' : 'Verificando...'}
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Primeiro acesso? Entre em contato com o administrador do sistema.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <LoginDemoInfo 
                  selectedTenant={selectedTenant?.subdomain}
                  onCredentialSelect={handleCredentialSelect}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}