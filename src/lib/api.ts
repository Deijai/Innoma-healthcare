// src/lib/api.ts
import { TenantManager } from './tenant-strategies';

export interface LoginRequest {
  usuario: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nome: string;
    usuario: string;
    papel: string;
    permissoes: string[];
    tenant_id: string;
  };
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface TenantConfig {
  nome: string;
  subdomain: string;
  configuracoes?: {
    timezone?: string;
    logo_url?: string;
    favicon_url?: string;
    cores_tema?: {
      primaria?: string;
      secundaria?: string;
      acento?: string;
    };
    modulos_ativos?: string[];
  };
  plano?: {
    tipo: string;
    status: string;
  };
}

class ApiService {
  private baseUrl: string;
  private tenantManager: TenantManager;
  private currentTenant: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const strategy = (process.env.NEXT_PUBLIC_TENANT_STRATEGY as any) || 'subdomain';
    const defaultTenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'demo';
    
    this.tenantManager = new TenantManager(strategy, defaultTenant);
    
    // Tentar recuperar tenant do localStorage primeiro
    this.initializeTenant();
  }

  /**
   * Inicializar tenant do localStorage ou estratégia padrão
   */
  private initializeTenant(): void {
    if (typeof window !== 'undefined') {
      // Prioridade 1: Tenant armazenado no localStorage
      const storedTenant = localStorage.getItem('selected_tenant');
      if (storedTenant) {
        this.currentTenant = storedTenant;
        return;
      }

      // Prioridade 2: Tenant da estratégia (URL, etc.)
      const detectedTenant = this.tenantManager.getCurrentTenant().subdomain;
      if (detectedTenant && detectedTenant !== 'demo') {
        this.currentTenant = detectedTenant;
        return;
      }
    }

    // Fallback: sem tenant definido (será definido na seleção)
    this.currentTenant = null;
  }

  /**
   * Definir tenant que será usado em todas as requisições
   * DEVE ser chamado sempre que um tenant for selecionado
   */
  setTenant(subdomain: string): void {
    this.currentTenant = subdomain;
    
    // Armazenar no localStorage para persistir entre reloads
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_tenant', subdomain);
    }
    
    console.log('🏢 Tenant definido para todas as requisições:', subdomain);
  }

  /**
   * Obter tenant atual
   */
  getCurrentTenant(): string | null {
    return this.currentTenant;
  }

  /**
   * Verificar se tenant está definido
   */
  hasTenant(): boolean {
    return !!this.currentTenant;
  }

  /**
   * Limpar tenant (logout)
   */
  clearTenant(): void {
    this.currentTenant = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selected_tenant');
    }
  }

  /**
   * Obter token armazenado (MÉTODO PÚBLICO)
   */
  public getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Verificar se há token válido (MÉTODO PÚBLICO)
   */
  public hasValidToken(): boolean {
    return !!this.getStoredToken();
  }

  private getHeaders(includeAuth = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // SEMPRE incluir tenant se estiver definido
    if (this.currentTenant) {
      headers['X-Subdomain'] = this.currentTenant;
    } else {
      console.warn('⚠️ Tenant não definido! Algumas requisições podem falhar.');
    }

    // Incluir autenticação se solicitado
    if (includeAuth) {
      const token = this.getStoredToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      const error: ApiError = data;
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  // Verificar se tenant existe
  async checkTenantExists(subdomain: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/tenants/verificar/${subdomain}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      return !data.disponivel; // Se não está disponível, significa que existe
    } catch (error) {
      console.warn('Erro ao verificar tenant:', error);
      return false;
    }
  }

  // Listar tenants (para seletor)
  async listTenants(params?: {
    search?: string;
    limit?: number;
    status?: string;
  }): Promise<{
    data: Array<{
      id: string;
      nome: string;
      subdomain: string;
      codigo: string;
      endereco?: {
        cidade?: string;
        estado?: string;
      };
    }>;
    total: number;
  }> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.search) searchParams.append('search', params.search);
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);

      const response = await fetch(
        `${this.baseUrl}/api/tenants?${searchParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.warn('Erro ao listar tenants:', error);
      // Retornar lista vazia em caso de erro
      return { data: [], total: 0 };
    }
  }

  // Obter configurações do tenant
  async getTenantConfig(subdomain?: string): Promise<TenantConfig> {
    const targetSubdomain = subdomain || this.currentTenant;
    
    if (!targetSubdomain) {
      throw new Error('Tenant não definido. Selecione um município primeiro.');
    }
    
    try {
      const response = await fetch(
        `${this.baseUrl}/api/tenants/configuracoes/${targetSubdomain}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Subdomain': targetSubdomain,
          },
        }
      );

      return await this.handleResponse<TenantConfig>(response);
    } catch (error) {
      console.warn('Erro ao carregar configurações do tenant:', error);
      // Retornar configuração padrão em caso de erro
      return {
        nome: 'Sistema de Saúde',
        subdomain: targetSubdomain,
        configuracoes: {
          cores_tema: {
            primaria: '#0066CC',
            secundaria: '#4A90E2',
            acento: '#FF6B35'
          }
        }
      };
    }
  }

  // Login do usuário
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    if (!this.currentTenant) {
      throw new Error('Tenant não definido. Selecione um município primeiro.');
    }

    const response = await fetch(`${this.baseUrl}/api/usuarios/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<LoginResponse>(response);
    
    // Armazenar token e dados do usuário
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_data', JSON.stringify(result.usuario));
      
      // Confirmar que o tenant usado no login está armazenado
      localStorage.setItem('auth_tenant', this.currentTenant);
      
      console.log('✅ Login realizado com sucesso para tenant:', this.currentTenant);
    }
    
    return result;
  }

  // Logout do usuário
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_tenant');
      // NÃO remover selected_tenant para manter seleção
    }
    
    console.log('🚪 Logout realizado - mantendo tenant selecionado');
  }

  // Verificar se usuário está autenticado
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const authTenant = typeof window !== 'undefined' ? localStorage.getItem('auth_tenant') : null;
    
    // Verificar se o token existe, se há tenant definido e se correspondem
    return !!token && !!this.currentTenant && authTenant === this.currentTenant;
  }

  // Obter dados do usuário armazenados
  getStoredUser(): LoginResponse['usuario'] | null {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('user_data');
    const authTenant = localStorage.getItem('auth_tenant');
    
    // Verificar se os dados são do tenant atual
    if (userData && authTenant === this.currentTenant) {
      return JSON.parse(userData);
    }
    
    return null;
  }

  // Obter perfil do usuário atual
  async getUserProfile(): Promise<LoginResponse['usuario']> {
    if (!this.currentTenant) {
      throw new Error('Tenant não definido');
    }

    if (!this.getStoredToken()) {
      throw new Error('Token não encontrado');
    }

    const response = await fetch(`${this.baseUrl}/api/usuarios/perfil`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    return await this.handleResponse<LoginResponse['usuario']>(response);
  }

  // Criar primeiro usuário (setup inicial)
  async createFirstUser(userData: {
    pessoa_id?: string;
    usuario: string;
    senha: string;
    papel: string;
  }): Promise<{ message: string; usuario: any }> {
    const response = await fetch(`${this.baseUrl}/api/usuarios/setup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return await this.handleResponse(response);
  }

  // Métodos utilitários para URLs
  buildTenantUrl(path: string, tenant?: string): string {
    return this.tenantManager.buildUrl(path, tenant);
  }

  // Navegar para uma URL com tenant correto
  navigateToTenant(path: string, tenant?: string): void {
    if (typeof window !== 'undefined') {
      const url = this.buildTenantUrl(path, tenant);
      window.location.href = url;
    }
  }

  // Métodos de debug públicos
  public getDebugInfo(): {
    currentTenant: string | null;
    hasToken: boolean;
    isAuthenticated: boolean;
    storedUser: any;
  } {
    return {
      currentTenant: this.currentTenant,
      hasToken: this.hasValidToken(),
      isAuthenticated: this.isAuthenticated(),
      storedUser: this.getStoredUser()
    };
  }
}

export const apiService = new ApiService();