// src/app/dashboard/users/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Clock,
  Settings,
  Eye,
  RefreshCw,
  MoreHorizontal,
  Download,
  Trash2,
  Key,
  Activity,
  Loader2
} from 'lucide-react';

// Interfaces
interface UsuarioDetalhado {
  id: string;
  pessoa_id?: string;
  usuario: string;
  papel: string;
  ativo: boolean;
  unidades_acesso?: string[];
  permissoes?: string[];
  ultimo_acesso?: string;
  tentativas_login: number;
  bloqueado_ate?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  pessoa?: {
    nome: string;
    cpf: string;
    data_nascimento: string;
    sexo: 'M' | 'F' | 'O';
    email?: string;
    telefone?: string;
    endereco?: {
      logradouro?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
    };
  };
}

interface UserDetailProps {
  params: { id: string };
}

export default function UserDetailPage({ params }: UserDetailProps) {
  const { user: currentUser } = useAuth();
  const [usuario, setUsuario] = useState<UsuarioDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);

  // Carregar dados do usuário
  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuário não encontrado');
        }
        throw new Error('Erro ao carregar dados do usuário');
      }

      const data = await response.json();
      setUsuario(data);

    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [params.id]);

  // Ações do usuário
  const toggleUserStatus = async () => {
    if (!usuario) return;
    
    try {
      setActionLoading('toggle-status');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ativo: !usuario.ativo })
      });

      if (!response.ok) throw new Error('Erro ao alterar status');

      await loadUserData();
      
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setActionLoading(null);
      setShowConfirmDialog(null);
    }
  };

  const blockUser = async (minutes: number = 30) => {
    try {
      setActionLoading('block');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${params.id}/bloquear`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tempo_minutos: minutes })
      });

      if (!response.ok) throw new Error('Erro ao bloquear usuário');

      await loadUserData();
      
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setActionLoading(null);
      setShowConfirmDialog(null);
    }
  };

  const unblockUser = async () => {
    try {
      setActionLoading('unblock');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${params.id}/desbloquear`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erro ao desbloquear usuário');

      await loadUserData();
      
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setActionLoading(null);
    }
  };

  const resetPassword = async () => {
    try {
      setActionLoading('reset-password');
      
      // Simular reset de senha
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Em um cenário real, aqui seria feita a chamada à API
      console.log('Reset de senha realizado');
      
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setActionLoading(null);
      setShowConfirmDialog(null);
    }
  };

  // Funções utilitárias
  const isUserBlocked = (): boolean => {
    if (!usuario?.bloqueado_ate) return false;
    return new Date(usuario.bloqueado_ate) > new Date();
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'MEDICO': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'ENFERMEIRO': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'RECEPCIONISTA': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'FARMACEUTICO': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'LABORATORISTA': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'GESTOR': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const getRoleDisplayName = (role: string) => {
    const names: Record<string, string> = {
      'ADMIN': 'Administrador',
      'MEDICO': 'Médico',
      'ENFERMEIRO': 'Enfermeiro',
      'RECEPCIONISTA': 'Recepcionista',
      'FARMACEUTICO': 'Farmacêutico',
      'LABORATORISTA': 'Laboratorista',
      'GESTOR': 'Gestor',
    };
    return names[role] || role;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getSexoDisplay = (sexo: string) => {
    const map = { 'M': 'Masculino', 'F': 'Feminino', 'O': 'Outro' };
    return map[sexo as keyof typeof map] || sexo;
  };

  // Componente de confirmação
  const ConfirmDialog = ({ action, title, message, onConfirm, onCancel }: {
    action: string;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex items-center space-x-3">
            <Button
              onClick={onConfirm}
              disabled={!!actionLoading}
              className="flex-1"
              //variant="destructive"
            >
              {actionLoading === action ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1" disabled={!!actionLoading}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Carregando dados do usuário...</span>
        </div>
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Erro ao carregar usuário</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex items-center justify-center space-x-3">
                <Button onClick={loadUserData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
                <Link href="/dashboard/users">
                  <Button>Voltar à lista</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const blocked = isUserBlocked();

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">
                {usuario.pessoa?.nome || usuario.usuario}
              </h1>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(usuario.papel)}`}>
                {getRoleDisplayName(usuario.papel)}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <p className="text-muted-foreground">@{usuario.usuario}</p>
              {usuario.ativo ? (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativo
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inativo
                </span>
              )}
              {blocked && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <Lock className="h-3 w-3 mr-1" />
                  Bloqueado
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button onClick={loadUserData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Link href={`/dashboard/users/${params.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados pessoais */}
          {usuario.pessoa && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome completo</label>
                      <p className="text-sm font-medium">{usuario.pessoa.nome}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">CPF</label>
                      <p className="text-sm font-medium">{formatCPF(usuario.pessoa.cpf)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data de nascimento</label>
                      <p className="text-sm font-medium">
                        {new Date(usuario.pessoa.data_nascimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sexo</label>
                      <p className="text-sm font-medium">{getSexoDisplay(usuario.pessoa.sexo)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {usuario.pessoa.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm font-medium">{usuario.pessoa.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {usuario.pessoa.telefone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                          <p className="text-sm font-medium">{usuario.pessoa.telefone}</p>
                        </div>
                      </div>
                    )}
                    
                    {usuario.pessoa.endereco && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                          <div className="text-sm font-medium space-y-1">
                            {usuario.pessoa.endereco.logradouro && (
                              <p>
                                {usuario.pessoa.endereco.logradouro}
                                {usuario.pessoa.endereco.numero && `, ${usuario.pessoa.endereco.numero}`}
                                {usuario.pessoa.endereco.complemento && ` - ${usuario.pessoa.endereco.complemento}`}
                              </p>
                            )}
                            {usuario.pessoa.endereco.bairro && (
                              <p>{usuario.pessoa.endereco.bairro}</p>
                            )}
                            {(usuario.pessoa.endereco.cidade || usuario.pessoa.endereco.estado) && (
                              <p>
                                {usuario.pessoa.endereco.cidade}
                                {usuario.pessoa.endereco.estado && ` - ${usuario.pessoa.endereco.estado}`}
                              </p>
                            )}
                            {usuario.pessoa.endereco.cep && (
                              <p>CEP: {usuario.pessoa.endereco.cep}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Permissões */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Permissões do Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usuario.permissoes && usuario.permissoes.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Este usuário possui {usuario.permissoes.length} permissões no sistema:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {usuario.permissoes.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2 p-2 bg-accent rounded-md">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          {permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma permissão específica atribuída</p>
                  <p className="text-sm text-muted-foreground">
                    Este usuário possui apenas as permissões padrão do papel {getRoleDisplayName(usuario.papel)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Atividade da conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Atividade da Conta</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Conta criada</label>
                      <p className="text-sm font-medium">{formatDate(usuario.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Última atualização</label>
                      <p className="text-sm font-medium">{formatDate(usuario.updated_at)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {usuario.ultimo_acesso && (
                    <div className="flex items-center space-x-3">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Último acesso</label>
                        <p className="text-sm font-medium">{formatDate(usuario.ultimo_acesso)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tentativas de login</label>
                      <p className="text-sm font-medium">
                        {usuario.tentativas_login > 0 ? (
                          <span className="text-yellow-600">{usuario.tentativas_login} tentativas falharam</span>
                        ) : (
                          <span className="text-green-600">Nenhuma tentativa falhada</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {blocked && usuario.bloqueado_ate && (
                    <div className="flex items-center space-x-3">
                      <Lock className="h-4 w-4 text-red-500" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Bloqueado até</label>
                        <p className="text-sm font-medium text-red-600">
                          {formatDate(usuario.bloqueado_ate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status atual */}
          <Card>
            <CardHeader>
              <CardTitle>Status da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  usuario.ativo ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                }`}>
                  {usuario.ativo ? (
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <h3 className="font-medium">
                  {usuario.ativo ? 'Conta Ativa' : 'Conta Inativa'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {usuario.ativo 
                    ? 'O usuário pode fazer login normalmente'
                    : 'O usuário não pode fazer login'
                  }
                </p>
              </div>

              {blocked && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                  <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm font-medium">Usuário Bloqueado</span>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Bloqueado até {formatDate(usuario.bloqueado_ate!)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/dashboard/users/${params.id}/edit`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Informações
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full justify-start text-orange-600 hover:text-orange-700"
                onClick={() => setShowConfirmDialog('reset-password')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'reset-password' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Resetar Senha
              </Button>

              {blocked ? (
                <Button
                  variant="outline"
                  className="w-full justify-start text-green-600 hover:text-green-700"
                  onClick={unblockUser}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'unblock' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Unlock className="h-4 w-4 mr-2" />
                  )}
                  Desbloquear Usuário
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start text-yellow-600 hover:text-yellow-700"
                  onClick={() => setShowConfirmDialog('block')}
                  disabled={!!actionLoading}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Bloquear Temporariamente
                </Button>
              )}

              <Button
                variant="outline"
                className={`w-full justify-start ${
                  usuario.ativo 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-green-600 hover:text-green-700'
                }`}
                onClick={() => setShowConfirmDialog('toggle-status')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'toggle-status' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : usuario.ativo ? (
                  <XCircle className="h-4 w-4 mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {usuario.ativo ? 'Desativar Conta' : 'Ativar Conta'}
              </Button>

              <div className="pt-3 border-t border-border">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações do sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID do usuário:</span>
                <span className="font-mono text-xs">{usuario.id}</span>
              </div>
              
              {usuario.pessoa_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID da pessoa:</span>
                  <span className="font-mono text-xs">{usuario.pessoa_id}</span>
                </div>
              )}
              
              {usuario.created_by && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado por:</span>
                  <span className="font-mono text-xs">{usuario.created_by}</span>
                </div>
              )}
              
              {usuario.updated_by && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atualizado por:</span>
                  <span className="font-mono text-xs">{usuario.updated_by}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zona de perigo */}
          {currentUser?.papel === 'ADMIN' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ações irreversíveis que afetam permanentemente esta conta.
                </p>
                
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  size="sm"
                  disabled={!!actionLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Usuário
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Diálogos de confirmação */}
      {showConfirmDialog === 'toggle-status' && (
        <ConfirmDialog
          action="toggle-status"
          title={usuario.ativo ? 'Desativar Usuário' : 'Ativar Usuário'}
          message={
            usuario.ativo 
              ? `Tem certeza que deseja desativar o usuário ${usuario.pessoa?.nome || usuario.usuario}? Ele não conseguirá mais fazer login.`
              : `Tem certeza que deseja ativar o usuário ${usuario.pessoa?.nome || usuario.usuario}? Ele poderá fazer login novamente.`
          }
          onConfirm={toggleUserStatus}
          onCancel={() => setShowConfirmDialog(null)}
        />
      )}

      {showConfirmDialog === 'block' && (
        <ConfirmDialog
          action="block"
          title="Bloquear Usuário"
          message={`Tem certeza que deseja bloquear temporariamente o usuário ${usuario.pessoa?.nome || usuario.usuario} por 30 minutos?`}
          onConfirm={() => blockUser(30)}
          onCancel={() => setShowConfirmDialog(null)}
        />
      )}

      {showConfirmDialog === 'reset-password' && (
        <ConfirmDialog
          action="reset-password"
          title="Resetar Senha"
          message={`Tem certeza que deseja resetar a senha do usuário ${usuario.pessoa?.nome || usuario.usuario}? Uma nova senha temporária será enviada por email.`}
          onConfirm={resetPassword}
          onCancel={() => setShowConfirmDialog(null)}
        />
      )}
    </div>
  );
}