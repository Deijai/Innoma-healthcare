// src/lib/api-services.ts
import { useState, useEffect } from 'react';

// Tipos base
export interface BaseResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Pessoa {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'O';
  email?: string;
  telefone?: string;
  status: 'ATIVO' | 'INATIVO';
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CriarPessoaRequest {
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
}

export interface AtualizarPessoaRequest extends Partial<CriarPessoaRequest> {
  status?: 'ATIVO' | 'INATIVO';
}

export interface Usuario {
  id: string;
  usuario: string;
  papel: string;
  ativo: boolean;
  permissoes: string[];
  pessoa?: Pessoa;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CriarUsuarioRequest {
  pessoa_id?: string;
  usuario: string;
  senha: string;
  papel: string;
  ativo?: boolean;
  permissoes?: string[];
  dadosPessoa?: CriarPessoaRequest;
}

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

class ApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const tenant = localStorage.getItem('selected_tenant');
    if (tenant) {
      headers['X-Subdomain'] = tenant;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  protected async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }
}

// Serviço de Pessoas
class PessoaService extends ApiService {
  async listar(params?: {
    search?: string;
    sexo?: string;
    status?: string;
    cidade?: string;
    estado?: string;
    page?: number;
    limit?: number;
  }): Promise<BaseResponse<Pessoa>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/pessoas${queryString ? `?${queryString}` : ''}`;
    
    return this.get<BaseResponse<Pessoa>>(endpoint);
  }

  async buscarPorId(id: string): Promise<Pessoa> {
    return this.get<Pessoa>(`/api/pessoas/${id}`);
  }

  async criar(data: CriarPessoaRequest): Promise<Pessoa> {
    return this.post<Pessoa>('/api/pessoas', data);
  }

  async atualizar(id: string, data: AtualizarPessoaRequest): Promise<Pessoa> {
    return this.put<Pessoa>(`/api/pessoas/${id}`, data);
  }

  async deletar(id: string): Promise<boolean> {
    await this.delete(`/api/pessoas/${id}`);
    return true;
  }
}

// Serviço de Usuários
class UsuarioService extends ApiService {
  async listar(params?: {
    search?: string;
    papel?: string;
    ativo?: string;
    page?: number;
    limit?: number;
  }): Promise<BaseResponse<Usuario>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/usuarios${queryString ? `?${queryString}` : ''}`;
    
    return this.get<BaseResponse<Usuario>>(endpoint);
  }

  async buscarPorId(id: string): Promise<Usuario> {
    return this.get<Usuario>(`/api/usuarios/${id}`);
  }

  async criar(data: CriarUsuarioRequest): Promise<Usuario> {
    return this.post<Usuario>('/api/usuarios', data);
  }

  async atualizar(id: string, data: Partial<CriarUsuarioRequest>): Promise<Usuario> {
    return this.put<Usuario>(`/api/usuarios/${id}`, data);
  }

  async deletar(id: string): Promise<boolean> {
    await this.delete(`/api/usuarios/${id}`);
    return true;
  }

  async login(usuario: string, senha: string): Promise<{
    token: string;
    usuario: Usuario;
  }> {
    return this.post('/api/usuarios/login', { usuario, senha });
  }
}

// Instâncias dos serviços
export const pessoaService = new PessoaService();
export const usuarioService = new UsuarioService();

// Hook customizado para usar pessoas
export function usePessoas(params?: {
  search?: string;
  sexo?: string;
  status?: string;
  cidade?: string;
  estado?: string;
  page?: number;
  limit?: number;
}) {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });

  const fetchPessoas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pessoaService.listar(params);
      setPessoas(response.data || []);
      setPagination({
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pessoas');
      setPessoas([]);
      setPagination({ total: 0, page: 1, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPessoas();
  }, [JSON.stringify(params)]);

  return {
    pessoas,
    loading,
    error,
    pagination,
    refetch: fetchPessoas,
  };
}

// Hook customizado para usar usuários
export function useUsuarios(params?: {
  search?: string;
  papel?: string;
  ativo?: string;
  page?: number;
  limit?: number;
}) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usuarioService.listar(params);
      setUsuarios(response.data || []);
      setPagination({
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
      setUsuarios([]);
      setPagination({ total: 0, page: 1, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [JSON.stringify(params)]);

  return {
    usuarios,
    loading,
    error,
    pagination,
    refetch: fetchUsuarios,
  };
}