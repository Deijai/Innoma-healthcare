// src/lib/api-services.ts

// ==========================================
// INTERFACES E TIPOS
// ==========================================

export interface Endereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  coordenadas?: {
    latitude?: number;
    longitude?: number;
  };
}

export interface Pessoa {
  id: string;
  tenant_id: string;
  nome: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'O';
  cpf: string;
  telefone?: string;
  email?: string;
  endereco?: Endereco;
  status: 'ATIVO' | 'INATIVO';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface Usuario {
  id: string;
  tenant_id: string;
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
  created_by?: string;
  updated_by?: string;
  pessoa?: {
    nome: string;
    cpf: string;
    email?: string;
    telefone?: string;
  };
}

// Requests
export interface CriarPessoaRequest {
  nome: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'O';
  cpf: string;
  telefone?: string;
  email?: string;
  endereco?: Endereco;
}

export interface AtualizarPessoaRequest {
  nome?: string;
  data_nascimento?: string;
  sexo?: 'M' | 'F' | 'O';
  telefone?: string;
  email?: string;
  endereco?: Endereco;
  status?: 'ATIVO' | 'INATIVO';
}

export interface CriarUsuarioRequest {
  pessoa_id?: string;
  usuario: string;
  senha: string;
  papel: string;
  ativo?: boolean;
  unidades_acesso?: string[];
  permissoes?: string[];
  // Para criar pessoa junto
  criar_pessoa?: boolean;
  pessoa_dados?: CriarPessoaRequest;
}

export interface AtualizarUsuarioRequest {
  senha?: string;
  papel?: string;
  ativo?: boolean;
  unidades_acesso?: string[];
  permissoes?: string[];
}

export interface AlterarSenhaRequest {
  senha_atual: string;
  nova_senha: string;
  confirmar_senha: string;
}

// Responses
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// ==========================================
// SERVIÇOS DE API
// ==========================================

class BaseApiService {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  protected getHeaders(includeAuth = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Incluir tenant
    const tenant = localStorage.getItem('selected_tenant');
    if (tenant) {
      headers['X-Subdomain'] = tenant;
    }

    // Incluir autenticação
    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  protected async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }
}

// ==========================================
// SERVIÇO DE PESSOAS
// ==========================================

export class PessoaService extends BaseApiService {
  async listar(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sexo?: string;
    status?: string;
    cidade?: string;
    estado?: string;
  }): Promise<PaginatedResponse<Pessoa>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sexo) searchParams.append('sexo', params.sexo);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.cidade) searchParams.append('cidade', params.cidade);
    if (params?.estado) searchParams.append('estado', params.estado);

    const response = await fetch(
      `${this.baseUrl}/api/pessoas?${searchParams.toString()}`,
      {
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<PaginatedResponse<Pessoa>>(response);
  }

  async buscarPorId(id: string): Promise<Pessoa> {
    const response = await fetch(`${this.baseUrl}/api/pessoas/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<Pessoa>(response);
  }

  async buscarPorCpf(cpf: string): Promise<Pessoa> {
    const response = await fetch(`${this.baseUrl}/api/pessoas/cpf/${cpf}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<Pessoa>(response);
  }

  async criar(data: CriarPessoaRequest): Promise<Pessoa> {
    const response = await fetch(`${this.baseUrl}/api/pessoas`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Pessoa>(response);
  }

  async atualizar(id: string, data: AtualizarPessoaRequest): Promise<Pessoa> {
    const response = await fetch(`${this.baseUrl}/api/pessoas/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Pessoa>(response);
  }

  async deletar(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/pessoas/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }
}

// ==========================================
// SERVIÇO DE USUÁRIOS
// ==========================================

export class UsuarioService extends BaseApiService {
  async listar(params?: {
    page?: number;
    limit?: number;
    search?: string;
    papel?: string;
    ativo?: boolean;
    unidade_id?: string;
  }): Promise<PaginatedResponse<Usuario>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.papel) searchParams.append('papel', params.papel);
    if (params?.ativo !== undefined) searchParams.append('ativo', params.ativo.toString());
    if (params?.unidade_id) searchParams.append('unidade_id', params.unidade_id);

    const response = await fetch(
      `${this.baseUrl}/api/usuarios?${searchParams.toString()}`,
      {
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<PaginatedResponse<Usuario>>(response);
  }

  async buscarPorId(id: string): Promise<Usuario> {
    const response = await fetch(`${this.baseUrl}/api/usuarios/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<Usuario>(response);
  }

  async criar(data: CriarUsuarioRequest): Promise<Usuario> {
    const response = await fetch(`${this.baseUrl}/api/usuarios`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Usuario>(response);
  }

  async atualizar(id: string, data: AtualizarUsuarioRequest): Promise<Usuario> {
    const response = await fetch(`${this.baseUrl}/api/usuarios/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Usuario>(response);
  }

  async alterarSenha(id: string, data: AlterarSenhaRequest): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/usuarios/${id}/senha`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async bloquear(id: string, tempoMinutos: number = 30): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/usuarios/${id}/bloquear`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ tempo_minutos: tempoMinutos }),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async desbloquear(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/usuarios/${id}/desbloquear`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async deletar(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/usuarios/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async obterPerfil(): Promise<Usuario> {
    const response = await fetch(`${this.baseUrl}/api/usuarios/perfil`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<Usuario>(response);
  }

  async criarPrimeiroUsuario(data: {
    usuario: string;
    senha: string;
    papel: string;
    pessoa_dados: CriarPessoaRequest;
  }): Promise<{ message: string; usuario: Usuario }> {
    const response = await fetch(`${this.baseUrl}/api/usuarios/setup`, {
      method: 'POST',
      headers: this.getHeaders(false), // Não incluir auth para setup
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string; usuario: Usuario }>(response);
  }
}

// ==========================================
// INSTÂNCIAS DOS SERVIÇOS
// ==========================================

export const pessoaService = new PessoaService();
export const usuarioService = new UsuarioService();

// ==========================================
// HOOKS PERSONALIZADOS
// ==========================================

import { useState, useEffect } from 'react';

export function usePessoas(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sexo?: string;
  status?: string;
  cidade?: string;
  estado?: string;
}) {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });

  const loadPessoas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pessoaService.listar(params);
      setPessoas(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pessoas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPessoas();
  }, [JSON.stringify(params)]);

  return {
    pessoas,
    loading,
    error,
    pagination,
    refetch: loadPessoas
  };
}

export function useUsuarios(params?: {
  page?: number;
  limit?: number;
  search?: string;
  papel?: string;
  ativo?: boolean;
  unidade_id?: string;
}) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usuarioService.listar(params);
      setUsuarios(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [JSON.stringify(params)]);

  return {
    usuarios,
    loading,
    error,
    pagination,
    refetch: loadUsuarios
  };
}

export function useUsuario(id: string) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsuario = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await usuarioService.buscarPorId(id);
      setUsuario(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuario();
  }, [id]);

  return {
    usuario,
    loading,
    error,
    refetch: loadUsuario
  };
}