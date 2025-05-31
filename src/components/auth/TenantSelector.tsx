// src/components/auth/TenantSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  Search, 
  Building2, 
  ChevronRight, 
  Loader2, 
  MapPin,
  Users,
  Star,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface Tenant {
  id: string;
  nome: string;
  subdomain: string;
  codigo: string;
  endereco?: {
    cidade?: string;
    estado?: string;
  };
  plano?: {
    tipo: string;
    status: string;
  };
  // Dados extras para melhor UX
  total_usuarios?: number;
  ultimo_acesso?: string;
  is_popular?: boolean;
}

interface TenantSelectorProps {
  onTenantSelect: (tenant: Tenant) => void;
  selectedTenant?: Tenant | null;
}

export function TenantSelector({ onTenantSelect, selectedTenant }: TenantSelectorProps) {
  const [search, setSearch] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([]);

  // Carregar tenants ao inicializar
  useEffect(() => {
    loadTenants();
    loadRecentTenants();
  }, []);

  // Filtrar tenants quando search muda
  useEffect(() => {
    if (search.length >= 2) {
      searchTenants(search);
    } else {
      setFilteredTenants(tenants);
      setIsSearching(false);
    }
  }, [search, tenants]);

  const loadTenants = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await apiService.listTenants({
        limit: 50,
        status: 'ATIVO'
      });
      
      if (data.data && data.data.length > 0) {
        // Adicionar dados fictícios para demonstração
        const enrichedTenants = data.data.map((tenant, index) => ({
          ...tenant,
          total_usuarios: Math.floor(Math.random() * 50) + 5,
          ultimo_acesso: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_popular: index < 3, // Primeiros 3 como populares
        }));
        
        setTenants(enrichedTenants);
        setFilteredTenants(enrichedTenants);
      } else {
        // Fallback com dados de exemplo
        loadFallbackTenants();
      }
    } catch (error) {
      console.error('Erro ao carregar tenants:', error);
      setError('Erro ao carregar lista de municípios');
      loadFallbackTenants();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackTenants = () => {
    const fallbackTenants: Tenant[] = [
      {
        id: '1',
        nome: 'Prefeitura Municipal de Ribeirão Preto',
        subdomain: 'ribeirao-preto',
        codigo: 'RP001',
        endereco: { cidade: 'Ribeirão Preto', estado: 'SP' },
        plano: { tipo: 'AVANCADO', status: 'ATIVO' },
        total_usuarios: 45,
        ultimo_acesso: new Date().toISOString(),
        is_popular: true
      },
      {
        id: '2',
        nome: 'Secretaria Municipal de Saúde - São Paulo',
        subdomain: 'sao-paulo',
        codigo: 'SP001',
        endereco: { cidade: 'São Paulo', estado: 'SP' },
        plano: { tipo: 'AVANCADO', status: 'ATIVO' },
        total_usuarios: 128,
        ultimo_acesso: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_popular: true
      },
      {
        id: '3',
        nome: 'Prefeitura de Santos',
        subdomain: 'santos',
        codigo: 'STS001',
        endereco: { cidade: 'Santos', estado: 'SP' },
        plano: { tipo: 'INTERMEDIARIO', status: 'ATIVO' },
        total_usuarios: 32,
        ultimo_acesso: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        is_popular: true
      },
      {
        id: '4',
        nome: 'Secretaria de Saúde - Campinas',
        subdomain: 'campinas',
        codigo: 'CP001',
        endereco: { cidade: 'Campinas', estado: 'SP' },
        plano: { tipo: 'INTERMEDIARIO', status: 'ATIVO' },
        total_usuarios: 28,
        ultimo_acesso: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        is_popular: false
      },
      {
        id: '5',
        nome: 'Prefeitura de Sorocaba',
        subdomain: 'sorocaba',
        codigo: 'SRC001',
        endereco: { cidade: 'Sorocaba', estado: 'SP' },
        plano: { tipo: 'BASICO', status: 'ATIVO' },
        total_usuarios: 15,
        ultimo_acesso: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        is_popular: false
      },
      {
        id: '6',
        nome: 'Demo - Município Exemplo',
        subdomain: 'demo',
        codigo: 'DEMO',
        endereco: { cidade: 'Demo City', estado: 'DF' },
        plano: { tipo: 'BASICO', status: 'ATIVO' },
        total_usuarios: 5,
        ultimo_acesso: new Date().toISOString(),
        is_popular: false
      }
    ];
    
    setTenants(fallbackTenants);
    setFilteredTenants(fallbackTenants);
  };

  const loadRecentTenants = () => {
    try {
      const recent = localStorage.getItem('recent_tenants');
      if (recent) {
        setRecentTenants(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Erro ao carregar tenants recentes:', error);
    }
  };

  const searchTenants = async (searchTerm: string) => {
    setIsSearching(true);
    
    try {
      const data = await apiService.listTenants({
        search: searchTerm,
        limit: 20,
        status: 'ATIVO'
      });
      
      if (data.data) {
        setFilteredTenants(data.data);
      } else {
        // Filtrar localmente como fallback
        const filtered = tenants.filter(tenant =>
          tenant.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tenant.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tenant.endereco?.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTenants(filtered);
      }
    } catch (error) {
      console.error('Erro ao buscar tenants:', error);
      // Filtrar localmente como fallback
      const filtered = tenants.filter(tenant =>
        tenant.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.endereco?.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTenants(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTenantSelect = (tenant: Tenant) => {
    onTenantSelect(tenant);
    
    // Salvar nos recentes
    saveToRecentTenants(tenant);
  };

  const saveToRecentTenants = (tenant: Tenant) => {
    try {
      let recent = [...recentTenants];
      
      // Remover se já existe
      recent = recent.filter(t => t.id !== tenant.id);
      
      // Adicionar no início
      recent.unshift(tenant);
      
      // Manter apenas os últimos 5
      recent = recent.slice(0, 5);
      
      setRecentTenants(recent);
      localStorage.setItem('recent_tenants', JSON.stringify(recent));
    } catch (error) {
      console.error('Erro ao salvar tenant recente:', error);
    }
  };

  const formatLastAccess = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Agora mesmo';
    if (diffHours < 24) return `${diffHours}h atrás`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getPlanColor = (tipo: string) => {
    const colors = {
      'BASICO': 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800',
      'INTERMEDIARIO': 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900',
      'AVANCADO': 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900',
      'PERSONALIZADO': 'text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-900',
    };
    return colors[tipo as keyof typeof colors] || colors.BASICO;
  };

  const renderTenantCard = (tenant: Tenant, isRecent = false) => (
    <button
      key={tenant.id}
      onClick={() => handleTenantSelect(tenant)}
      className="w-full p-4 text-left border border-border hover:bg-accent hover:border-accent-foreground transition-all duration-200 rounded-lg group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            {tenant.is_popular && (
              <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <p className="font-medium text-sm truncate">{tenant.nome}</p>
              {isRecent && (
                <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{tenant.endereco?.cidade}, {tenant.endereco?.estado}</span>
              </div>
              
              {tenant.total_usuarios && (
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{tenant.total_usuarios} usuários</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                Código: {tenant.codigo}
              </span>
              
              {tenant.plano && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(tenant.plano.tipo)}`}>
                  {tenant.plano.tipo}
                </span>
              )}
            </div>
            
            {tenant.ultimo_acesso && (
              <p className="text-xs text-muted-foreground mt-1">
                Último acesso: {formatLastAccess(tenant.ultimo_acesso)}
              </p>
            )}
          </div>
        </div>
        
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 ml-2" />
      </div>
    </button>
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Selecionar Município</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Escolha o município para acessar o sistema
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadTenants}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por município, código ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-3 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-lg"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Tenant Selecionado */}
        {selectedTenant && (
          <div className="p-4 border border-primary bg-primary/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{selectedTenant.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedTenant.endereco?.cidade}, {selectedTenant.endereco?.estado} • {selectedTenant.codigo}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTenantSelect(null as any)}
              >
                Alterar
              </Button>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Lista de Tenants */}
        {!selectedTenant && (
          <div className="space-y-4">
            {/* Tenants Recentes */}
            {recentTenants.length > 0 && search.length < 2 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Acessados recentemente
                </h4>
                <div className="space-y-2">
                  {recentTenants.slice(0, 3).map(tenant => renderTenantCard(tenant, true))}
                </div>
              </div>
            )}

            {/* Todos os Tenants */}
            <div>
              {recentTenants.length > 0 && search.length < 2 && (
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  Todos os municípios
                </h4>
              )}
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Carregando municípios...</p>
                    </div>
                  </div>
                ) : filteredTenants.length > 0 ? (
                  filteredTenants.map(tenant => renderTenantCard(tenant))
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {search.length >= 2 ? 'Nenhum município encontrado' : 'Nenhum município disponível'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {search.length >= 2 ? 'Tente buscar com outros termos' : 'Verifique sua conexão e tente novamente'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {!selectedTenant && !isLoading && tenants.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-primary">{tenants.length}</p>
                <p className="text-xs text-muted-foreground">Municípios</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-primary">
                  {tenants.filter(t => t.is_popular).length}
                </p>
                <p className="text-xs text-muted-foreground">Populares</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-primary">
                  {tenants.reduce((acc, t) => acc + (t.total_usuarios || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Usuários</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}