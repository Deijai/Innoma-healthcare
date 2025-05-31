// ===================================================================
// COMPONENTE PARA PRIMEIRO USUÁRIO (SETUP INICIAL)
// src/app/setup/page.tsx
// ===================================================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PersonForm } from '@/components/forms/PersonForm';
import { usuarioService } from '@/lib/api-services';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { Building2, User, Shield, CheckCircle } from 'lucide-react';

export default function SetupPage() {
  const [step, setStep] = useState<'welcome' | 'person' | 'user' | 'complete'>('welcome');
  const [personData, setPersonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handlePersonSubmit = async (data: any) => {
    setPersonData(data);
    setStep('user');
  };

  const handleUserSubmit = async (userData: any) => {
    try {
      setLoading(true);
      
      const result = await usuarioService.criarPrimeiroUsuario({
        usuario: userData.usuario,
        senha: userData.senha,
        papel: 'ADMIN',
        pessoa_dados: personData
      });

      setStep('complete');
      toast.success('Sistema configurado com sucesso!');
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Erro no setup:', error);
      toast.error('Erro ao criar primeiro usuário');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Bem-vindo ao Sistema de Gestão de Saúde</CardTitle>
              <p className="text-muted-foreground">
                Configure o sistema criando o primeiro administrador
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-border rounded-lg">
                  <User className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium">1. Seus Dados</h3>
                  <p className="text-sm text-muted-foreground">Cadastre suas informações pessoais</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium">2. Usuário Admin</h3>
                  <p className="text-sm text-muted-foreground">Crie sua conta de administrador</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium">3. Pronto!</h3>
                  <p className="text-sm text-muted-foreground">Sistema configurado e funcionando</p>
                </div>
              </div>
              
              <div className="text-center">
                <Button onClick={() => setStep('person')} size="lg">
                  Começar Configuração
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'person':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Passo 1: Seus Dados Pessoais</h1>
              <p className="text-muted-foreground">
                Informe seus dados para criar sua conta de administrador
              </p>
            </div>
            
            <PersonForm
              onSubmit={handlePersonSubmit}
              title="Dados do Administrador"
              submitButtonText="Continuar"
              showEnderecoSection={false}
            />
          </div>
        );

      case 'user':
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Passo 2: Conta de Administrador</CardTitle>
              <p className="text-muted-foreground">
                Defina seu nome de usuário e senha
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUserSubmit({
                  usuario: formData.get('usuario'),
                  senha: formData.get('senha')
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nome de usuário</label>
                    <input
                      name="usuario"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                      placeholder="admin"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Senha</label>
                    <input
                      name="senha"
                      type="password"
                      required
                      minLength={6}
                      className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Criando...' : 'Finalizar Configuração'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );

      case 'complete':
        return (
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Sistema Configurado!</h1>
              <p className="text-muted-foreground mb-6">
                Seu primeiro usuário administrador foi criado com sucesso. 
                Você será redirecionado para a página de login.
              </p>
              <Button onClick={() => router.push('/login')}>
                Ir para Login
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {renderStep()}
    </div>
  );
}