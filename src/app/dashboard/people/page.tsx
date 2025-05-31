// src/app/dashboard/people/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput, StatusBadge } from '@/components/forms/FormComponents';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  UserPlus,
  Trash2,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { pessoaService, usePessoas, Pessoa } from '@/lib/api-services';
import { formatCPF, formatPhone, formatDate, getSexoDisplay } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/Skeleton';

interface Filters {
  search: string;
  sexo: string;
  status: string;
  cidade: string;
  estado: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PeopleManagementPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    sexo: '',
    status: '',
    cidade: '',
    estado: ''
  });
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Usar hook personalizado para carregar pessoas
  const { pessoas, loading, error, refetch } = usePessoas({
    page: pagination.page,
    limit: pagination.limit,
    search: filters.search || undefined,
    sexo: filters.sexo || undefined,
    status: filters.status || undefined,
    cidade: filters.cidade || undefined,
    estado: filters.estado || undefined,
  });

  // Atualizar paginação quando dados carregarem
  useEffect(() => {
    if (pessoas.length > 0) {
      setPagination(prev => ({
        ...prev,
        total: pessoas.length, // Isso viria da resposta da API
        totalPages: Math.ceil(pessoas.length / prev.limit)
      }));
    }
  }, [pessoas]);

  // Debounce para filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        refetch();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const handlePersonAction = async (action: string, pessoaId: string) => {
    try {
      setActionLoading(pessoaId);
      
      switch (action) {
        case 'delete':
          await pessoaService.deletar(pessoaId);
          refetch();
          break;
        case 'toggle-status':
          // Implementar quando tiver endpoint de toggle status
          break;
      }
    } catch (error) {
      console.error(`Erro ao executar ação ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const createUserFromPerson = (pessoaId: string) => {
    // Redirecionar para criação de usuário com pessoa pré-selecionada
    window.location.href = `/dashboard/users/new?pessoa_id=${pessoaId}`;
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
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
            <label className="text-sm font-medium mb-2 block">Sexo</label>
            <select
              value={filters.sexo}
              onChange={(e) => setFilters(prev => ({ ...prev, sexo: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
            >
              <option value="">Todos</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
            >
              <option value="">Todos</option>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Cidade</label>
            <input
              type="text"
              value={filters.cidade}
              onChange={(e) => setFilters(prev => ({ ...prev, cidade: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
              placeholder="Nome da cidade"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ search: '', sexo: '', status: '', cidade: '', estado: '' })}
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

  // Componente de linha da pessoa
  const PersonRow = ({ pessoa }: { pessoa: Pessoa }) => {
    const age = calculateAge(pessoa.data_nascimento);
    
    return (
      <div className="border-b border-border hover:bg-accent/50 transition-colors">
        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* Informações principais */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPeople.includes(pessoa.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPeople(prev => [...prev, pessoa.id]);
                    } else {
                      setSelectedPeople(prev => prev.filter(id => id !== pessoa.id));
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
                    <h3 className="font-medium text-sm">{pessoa.nome}</h3>
                    <p className="text-xs text-muted-foreground">
                      CPF: {formatCPF(pessoa.cpf)}
                    </p>
                  </div>

                  {/* Status badges */}
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={pessoa.status} size="sm" />
                    <span className="text-xs px-2 py-1 bg-accent rounded-full">
                      {getSexoDisplay(pessoa.sexo)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-accent rounded-full">
                      {age} anos
                    </span>
                  </div>
                </div>

                {/* Informações adicionais */}
                <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                  {pessoa.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span>{pessoa.email}</span>
                    </div>
                  )}
                  
                  {pessoa.telefone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{formatPhone(pessoa.telefone)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Nascido em {formatDate(pessoa.data_nascimento)}</span>
                  </div>

                  {pessoa.endereco?.cidade && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{pessoa.endereco.cidade}, {pessoa.endereco.estado}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center space-x-2 ml-4">
              <Link href={`/dashboard/people/${pessoa.id}`}>
                <Button variant="ghost" size="sm" title="Visualizar">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>

              <Link href={`/dashboard/people/${pessoa.id}/edit`}>
                <Button variant="ghost" size="sm" title="Editar">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => createUserFromPerson(pessoa.id)}
                title="Criar usuário para esta pessoa"
                className="text-blue-600 hover:text-blue-700"
              >
                <UserPlus className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePersonAction('delete', pessoa.id)}
                disabled={actionLoading === pessoa.id}
                title="Deletar pessoa"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
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

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Pessoas</h1>
          <p className="text-muted-foreground">
            Gerencie pessoas cadastradas no sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Link href="/dashboard/people/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Pessoa
            </Button>
          </Link>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <SearchInput
              value={filters.search}
              onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
              placeholder="Buscar por nome, CPF, email ou telefone..."
              className="flex-1"
            />
            
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
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de pessoas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {pessoas.length} pessoas encontradas
            </CardTitle>
            
            {selectedPeople.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedPeople.length} selecionadas
                </span>
                <Button size="sm" variant="outline">
                  Ações em lote
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {pessoas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma pessoa encontrada</h3>
              <p className="text-muted-foreground mb-6">
                {filters.search || filters.sexo || filters.status ? 
                  'Tente ajustar os filtros para encontrar pessoas.' :
                  'Comece cadastrando a primeira pessoa do sistema.'
                }
              </p>
              <Link href="/dashboard/people/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeira Pessoa
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              {pessoas.map((pessoa) => (
                <PersonRow key={pessoa.id} pessoa={pessoa} />
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
                  {pagination.total} pessoas
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