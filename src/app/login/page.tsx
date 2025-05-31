// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TenantSelector } from '@/components/auth/TenantSelector';
import { LoginDemoInfo } from '@/components/auth/LoginDemoInfo';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2, AlertCircle, Building2, ArrowLeft } from 'lucide-react';

// Configurar estratégia como seleção de tenant
const TENANT_STRATEGY = 'login-field';

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
  
  const { login, isAuthenticated, setTenant, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Verificar estratégia de tenant e inicializar
  useEffect(() => {
    // Para estratégia de seleção sempre mostrar o seletor primeiro
    setStep('tenant');
  }, []);

  // Redirecionar se já autenticado
  useEffect(() => {
    console.log('🔍 LoginPage - Verificando autenticação:', {
      isAuthenticated,
      authLoading,
      selectedTenant
    });

    if (!authLoading && isAuthenticated) {
      console.log('✅ Já autenticado, redirecionando para dashboard...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleTenantSelect = (tenant: TenantInfo) => {
    console.log('🏢 Tenant selecionado:', tenant);
    
    // IMPORTANTE: Definir tenant no contexto antes de prosseguir
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
      console.log('🔐 Tentando fazer login...');
      await login({ usuario: usuario.trim(), senha });
      // O redirecionamento é feito automaticamente no AuthContext
      console.log('✅ Login realizado, aguardando redirecionamento...');
    } catch (error) {
      console.error('❌ Erro no login:', error);
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

          {/* Informações de Login Demo */}
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
        {/* Header com info do tenant */}
        {selectedTenant && (
          <div className="text-center space-y-2">
            <Building2 className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-xl font-bold">{selectedTenant.nome}</h1>
            <p className="text-sm text-muted-foreground">
              Sistema de Gestão de Saúde
            </p>
          </div>
        )}

        {/* Card de Login */}
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
            {/* Info do Tenant Selecionado */}
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

            {/* Formulário */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Campo Usuario */}
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

              {/* Campo Senha */}
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

              {/* Mensagem de Erro */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Botão de Login */}
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

            {/* Links Adicionais */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Primeiro acesso? Entre em contato com o administrador do sistema.
              </p>
              
              {/* Informações de Demo para desenvolvimento */}
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