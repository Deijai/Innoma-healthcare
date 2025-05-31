// src/app/dashboard/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Lock, 
  Unlock, 
  Trash2,
  Download,
  RefreshCw,
  Shield,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

// Interfaces
interface Usuario {
  id: string;
  pessoa_id?: string;
  usuario: string;
  papel: 'ADMIN' | 'MEDICO' | 'ENFERMEIRO' | 'RECEPCIONISTA' | 'FARMACEUTICO' | 'LABORATORISTA' | 'GESTOR';
  ativo: boolean;
  unidades_acesso?: string[];
  permissoes?: string[];
  ultimo_acesso?: string;
  tentativas_login: number;
  bloqueado_ate?: string;
  created_at: string;
  updated_at: string;
  pessoa?: {
    nome: string;
    cpf: string;
    email?: string;
    telefone?: string;
  };
}

interface Filters {
  search: string;
  papel: string;
  ativo: string;
  unidade_id: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Componente principal
export default function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros e paginação
  const [filters, setFilters] = useState<Filters>({
    search: '',
    papel: '',
    ativo: '',
    unidade_id: ''
  });
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Carregar usuários
  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.papel && { papel: filters.papel }),
        ...(filters.ativo && { ativo: filters.ativo }),
        ...(filters.unidade_id && { unidade_id: filters.unidade_id })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        },
  
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
      }

      const data = await response.json();
      
      setUsuarios(data.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 0
      }));

    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Efeitos
  useEffect(() => {
    loadUsuarios();
  }, [pagination.page, pagination.limit]);

  // Buscar quando filtros mudarem (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        loadUsuarios();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  // Ações dos usuários
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ativo: !currentStatus })
      });

      if (!response.ok) throw new Error('Erro ao alterar status');

      await loadUsuarios();
      
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setActionLoading(null);
    }
  };

  const blockUser = async (userId: string, minutes: number = 30) => {
    try {
      setActionLoading(userId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}/bloquear`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tempo_minutos: minutes })
      });

      if (!response.ok) throw new Error('Erro ao bloquear usuário');

      await loadUsuarios();
      
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setActionLoading(null);
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}/desbloquear`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erro ao desbloquear usuário');

      await loadUsuarios();
      
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setActionLoading(null);
    }
  };

  // Funções utilitárias
  const isUserBlocked = (user: Usuario): boolean => {
    if (!user.bloqueado_ate) return false;
    return new Date(user.bloqueado_ate) > new Date();
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

  // Componente de filtros
  const FiltersPanel = () => (
    <Card className={`transition-all duration-300 ${showFilters ? 'block' : 'hidden'}`}>
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Papel</label>
            <select
              value={filters.papel}
              onChange={(e) => setFilters(prev => ({ ...prev, papel: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
            >
              <option value="">Todos os papéis</option>
              <option value="ADMIN">Administrador</option>
              <option value="MEDICO">Médico</option>
              <option value="ENFERMEIRO">Enfermeiro</option>
              <option value="RECEPCIONISTA">Recepcionista</option>
              <option value="FARMACEUTICO">Farmacêutico</option>
              <option value="LABORATORISTA">Laboratorista</option>
              <option value="GESTOR">Gestor</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select
              value={filters.ativo}
              onChange={(e) => setFilters(prev => ({ ...prev, ativo: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end space-x-2">
            <Button
              onClick={() => setFilters({ search: '', papel: '', ativo: '', unidade_id: '' })}
              variant="outline"
              size="sm"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Componente de linha da tabela
  const UserRow = ({ usuario }: { usuario: Usuario }) => {
    const blocked = isUserBlocked(usuario);
    
    return (
      <div className="border-b border-border hover:bg-accent/50 transition-colors">
        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* Informações principais */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(usuario.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(prev => [...prev, usuario.id]);
                    } else {
                      setSelectedUsers(prev => prev.filter(id => id !== usuario.id));
                    }
                  }}
                  className="rounded border-border"
                />
                
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="font-medium text-sm">
                      {usuario.pessoa?.nome || usuario.usuario}
                    </h3>
                    <p className="text-xs text-muted-foreground">@{usuario.usuario}</p>
                  </div>

                  {/* Status badges */}
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(usuario.papel)}`}>
                      {getRoleDisplayName(usuario.papel)}
                    </span>
                    
                    {usuario.ativo ? (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inativo
                      </span>
                    )}

                    {blocked && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Lock className="h-3 w-3 mr-1" />
                        Bloqueado
                      </span>
                    )}
                  </div>
                </div>

                {/* Informações adicionais */}
                <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                  {usuario.pessoa?.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span>{usuario.pessoa.email}</span>
                    </div>
                  )}
                  
                  {usuario.pessoa?.telefone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{usuario.pessoa.telefone}</span>
                    </div>
                  )}
                  
                  {usuario.ultimo_acesso && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Último acesso: {formatDate(usuario.ultimo_acesso)}</span>
                    </div>
                  )}

                  {usuario.permissoes && (
                    <div className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>{usuario.permissoes.length} permissões</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center space-x-2 ml-4">
              <Link href={`/dashboard/users/${usuario.id}`}>
                <Button variant="ghost" size="sm" title="Visualizar">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>

              <Link href={`/dashboard/users/${usuario.id}/edit`}>
                <Button variant="ghost" size="sm" title="Editar">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>

              {blocked ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => unblockUser(usuario.id)}
                  disabled={actionLoading === usuario.id}
                  title="Desbloquear usuário"
                  className="text-green-600 hover:text-green-700"
                >
                  {actionLoading === usuario.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => blockUser(usuario.id)}
                  disabled={actionLoading === usuario.id}
                  title="Bloquear usuário"
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  {actionLoading === usuario.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleUserStatus(usuario.id, usuario.ativo)}
                disabled={actionLoading === usuario.id}
                title={usuario.ativo ? 'Desativar' : 'Ativar'}
                className={usuario.ativo ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
              >
                {actionLoading === usuario.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : usuario.ativo ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </Button>

              <Button variant="ghost" size="sm" title="Mais opções">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, permissões e acessos do sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button onClick={loadUsuarios} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Link href="/dashboard/users/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </Link>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome, usuário, email ou CPF..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Painel de filtros */}
      <FiltersPanel />

      {/* Resultados */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {loading ? 'Carregando...' : `${pagination.total} usuários encontrados`}
            </CardTitle>
            
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedUsers.length} selecionados
                </span>
                <Button size="sm" variant="outline">
                  Ações em lote
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Carregando usuários...</span>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground mb-6">
                {filters.search || filters.papel || filters.ativo ? 
                  'Tente ajustar os filtros para encontrar usuários.' :
                  'Comece criando o primeiro usuário do sistema.'
                }
              </p>
              <Link href="/dashboard/users/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Usuário
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              {usuarios.map((usuario) => (
                <UserRow key={usuario.id} usuario={usuario} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                  {pagination.total} usuários
                </span>
                
                <select
                  value={pagination.limit}
                  onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                  className="border border-input bg-background px-2 py-1 text-sm rounded"
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}