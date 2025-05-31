// src/lib/tenant-strategies.ts

/**
 * ESTRATÉGIAS PARA IDENTIFICAÇÃO DE TENANT
 * 
 * 1. SUBDOMAIN (Recomendado para produção)
 * 2. QUERY PARAMETER (Bom para desenvolvimento)
 * 3. CAMPO NO LOGIN (Mais flexível)
 * 4. PATH PREFIX (Alternativa ao subdomain)
 */

export type TenantStrategy = 'subdomain' | 'query' | 'login-field' | 'path';

export interface TenantInfo {
  subdomain: string;
  strategy: TenantStrategy;
  isValid: boolean;
}

export class TenantManager {
  private strategy: TenantStrategy;
  private defaultTenant: string;

  constructor(strategy: TenantStrategy = 'subdomain', defaultTenant = 'demo') {
    this.strategy = strategy;
    this.defaultTenant = defaultTenant;
  }

  /**
   * ESTRATÉGIA 1: SUBDOMAIN
   * URL: https://ribeirao-preto.sistema-saude.com.br
   * Tenant: ribeirao-preto
   */
  private getFromSubdomain(): string {
    if (typeof window === 'undefined') return this.defaultTenant;
    
    const hostname = window.location.hostname;
    
    // Se for localhost ou IP, usar tenant padrão
    if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return this.defaultTenant;
    }
    
    // Extrair subdomain (assumindo formato: subdomain.domain.com)
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return parts[0];
    }
    
    return this.defaultTenant;
  }

  /**
   * ESTRATÉGIA 2: QUERY PARAMETER
   * URL: https://sistema-saude.com.br/login?tenant=ribeirao-preto
   * Tenant: ribeirao-preto
   */
  private getFromQuery(): string {
    if (typeof window === 'undefined') return this.defaultTenant;
    
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tenant') || this.defaultTenant;
  }

  /**
   * ESTRATÉGIA 3: PATH PREFIX
   * URL: https://sistema-saude.com.br/ribeirao-preto/login
   * Tenant: ribeirao-preto
   */
  private getFromPath(): string {
    if (typeof window === 'undefined') return this.defaultTenant;
    
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    
    // Se o primeiro segmento do path é um tenant
    if (pathParts.length > 0 && pathParts[0] !== 'login' && pathParts[0] !== 'dashboard') {
      return pathParts[0];
    }
    
    return this.defaultTenant;
  }

  /**
   * Obter tenant baseado na estratégia configurada
   */
  getCurrentTenant(): TenantInfo {
    let subdomain: string;
    
    switch (this.strategy) {
      case 'subdomain':
        subdomain = this.getFromSubdomain();
        break;
      case 'query':
        subdomain = this.getFromQuery();
        break;
      case 'path':
        subdomain = this.getFromPath();
        break;
      default:
        subdomain = this.defaultTenant;
    }

    return {
      subdomain,
      strategy: this.strategy,
      isValid: subdomain !== this.defaultTenant || this.strategy === 'login-field'
    };
  }

  /**
   * Validar se tenant existe (deve ser chamado após obter tenant)
   */
  async validateTenant(tenant: string): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants/verificar/${tenant}`);
      const data = await response.json();
      return !data.disponivel; // Se não está disponível, significa que existe
    } catch (error) {
      console.error('Erro ao validar tenant:', error);
      return false;
    }
  }

  /**
   * Construir URL com tenant (útil para redirecionamentos)
   */
  buildUrl(path: string, tenant?: string): string {
    const currentTenant = tenant || this.getCurrentTenant().subdomain;
    
    switch (this.strategy) {
      case 'subdomain':
        if (typeof window !== 'undefined') {
          const protocol = window.location.protocol;
          const hostname = window.location.hostname;
          const port = window.location.port ? `:${window.location.port}` : '';
          
          if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
            return `${protocol}//${hostname}${port}${path}?tenant=${currentTenant}`;
          }
          
          return `${protocol}//${currentTenant}.${hostname.split('.').slice(1).join('.')}${port}${path}`;
        }
        return path;
        
      case 'query':
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}tenant=${currentTenant}`;
        
      case 'path':
        return `/${currentTenant}${path}`;
        
      default:
        return path;
    }
  }
}