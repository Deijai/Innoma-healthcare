// src/lib/api-services.ts
import { useState, useEffect } from 'react';

// ===================================
// INTERFACES BASE
// ===================================

export interface Endereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface Pessoa {
  id: string;
  nome: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'O';
  cpf: string;
  telefone?: string;
  email?: string;
  endereco?: Endereco;
  status: 'ATIVO' | 'INATIVO';
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface Usuario {
  id: string;
  pessoa_id: string;
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
  pessoa?: Pessoa;
}

export interface Paciente {
  id: string;
  pessoa_id: string;
  numero_cartao_sus?: string;
  tipo_sanguineo?: string;
  alergias?: string;
  historico_medico?: string;
  medicamentos_uso_continuo?: Array<{
    nome: string;
    dosagem: string;
    frequencia: string;
  }>;
  contato_emergencia?: {
    nome: string;
    parentesco: string;
    telefone: string;
  };
  observacoes?: string;
  status: 'ATIVO' | 'INATIVO';
  created_at: string;
  updated_at: string;
  pessoa?: Pessoa;
}

export interface Medico {
  id: string;
  pessoa_id: string;
  crm: string;
  especialidade: string;
  conselho_estado: string;
  data_formacao?: string;
  instituicao_formacao?: string;
  unidades_vinculadas?: string[];
  horarios_atendimento?: Array<{
    dia_semana: number;
    hora_inicio: string;
    hora_fim: string;
    unidade_id: string;
  }>;
  valor_consulta?: number;
  aceita_convenio?: boolean;
  convenios?: string[];
  status: 'ATIVO' | 'INATIVO';
  created_at: string;
  updated_at: string;
  pessoa?: Pessoa;
}

// ===================================
// INTERFACES DE REQUEST
// ===================================

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
  pessoa_id: string;
  usuario: string;
  senha: string;
  papel: string;
  ativo?: boolean;
  unidades_acesso?: string[];
  permissoes?: string[];
}

export interface CriarUsuarioCompletoRequest {
  usuario: string;
  senha: string;
  papel: string;
  ativo?: boolean;
  unidades_acesso?: string[];
  permissoes?: string[];
  dadosPessoa: CriarPessoaRequest;
}

export interface CriarPacienteRequest {
  pessoa_id: string;
  numero_cartao_sus?: string;
  tipo_sanguineo?: string;
  alergias?: string;
  historico_medico?: string;
  medicamentos_uso_continuo?: Array<{
    nome: string;
    dosagem: string;
    frequencia: string;
  }>;
  contato_emergencia?: {
    nome: string;
    parentesco: string;
    telefone: string;
  };
  observacoes?: string;
}

export interface CriarMedicoRequest {
  pessoa_id: string;
  crm: string;
  especialidade: string;
  conselho_estado: string;
  data_formacao?: string;
  instituicao_formacao?: string;
  unidades_vinculadas?: string[];
  horarios_atendimento?: Array<{
    dia_semana: number;
    hora_inicio: string;
    hora_fim: string;
    unidade_id: string;
  }>;
  valor_consulta?: number;
  aceita_convenio?: boolean;
  convenios?: string[];
}

// ===================================
// INTERFACES DE RESPONSE
// ===================================

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BuscarPessoasParams {
  page?: number;
  limit?: number;
  search?: string;
  sexo?: 'M' | 'F' | 'O';
  status?: 'ATIVO' | 'INATIVO';
  cidade?: string;
  estado?: string;
}

// ===================================
// CONFIGURAÇÃO DA API
// ===================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

class ApiClient {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
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

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

const apiClient = new ApiClient();

// ===================================
// SERVIÇOS DE PESSOA
// ===================================

export const pessoaService = {
  listar: (params: BuscarPessoasParams = {}): Promise<PaginatedResponse<Pessoa>> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return apiClient.get<PaginatedResponse<Pessoa>>(
      `/api/pessoas?${searchParams.toString()}`
    );
  },

  buscarPorId: (id: string): Promise<Pessoa> => {
    return apiClient.get<Pessoa>(`/api/pessoas/${id}`);
  },

  buscarPorCpf: (cpf: string): Promise<Pessoa> => {
    return apiClient.get<Pessoa>(`/api/pessoas/cpf/${cpf}`);
  },

  criar: (data: CriarPessoaRequest): Promise<Pessoa> => {
    return apiClient.post<Pessoa>('/api/pessoas', data);
  },

  atualizar: (id: string, data: AtualizarPessoaRequest): Promise<Pessoa> => {
    return apiClient.put<Pessoa>(`/api/pessoas/${id}`, data);
  },

  deletar: (id: string): Promise<boolean> => {
    return apiClient.delete<boolean>(`/api/pessoas/${id}`);
  }
};

// ===================================
// SERVIÇOS DE USUÁRIO
// ===================================

export const usuarioService = {
  listar: (params: any = {}): Promise<PaginatedResponse<Usuario>> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return apiClient.get<PaginatedResponse<Usuario>>(
      `/api/usuarios?${searchParams.toString()}`
    );
  },

  buscarPorId: (id: string): Promise<Usuario> => {
    return apiClient.get<Usuario>(`/api/usuarios/${id}`);
  },

  criar: (data: CriarUsuarioRequest): Promise<Usuario> => {
    return apiClient.post<Usuario>('/api/usuarios', data);
  },

  criarCompleto: (data: CriarUsuarioCompletoRequest): Promise<Usuario> => {
    return apiClient.post<Usuario>('/api/usuarios/completo', data);
  },

  atualizar: (id: string, data: any): Promise<Usuario> => {
    return apiClient.put<Usuario>(`/api/usuarios/${id}`, data);
  },

  deletar: (id: string): Promise<boolean> => {
    return apiClient.delete<boolean>(`/api/usuarios/${id}`);
  },

  bloquear: (id: string, tempo_minutos: number): Promise<boolean> => {
    return apiClient.put<boolean>(`/api/usuarios/${id}/bloquear`, { tempo_minutos });
  },

  desbloquear: (id: string): Promise<boolean> => {
    return apiClient.put<boolean>(`/api/usuarios/${id}/desbloquear`, {});
  },

  alterarSenha: (id: string, senhaAtual: string, novaSenha: string): Promise<boolean> => {
    return apiClient.put<boolean>(`/api/usuarios/${id}/senha`, {
      senha_atual: senhaAtual,
      nova_senha: novaSenha
    });
  },

  login: (usuario: string, senha: string): Promise<{ token: string; usuario: Usuario }> => {
    return apiClient.post<{ token: string; usuario: Usuario }>('/api/usuarios/login', {
      usuario,
      senha
    });
  }
};

// ===================================
// SERVIÇOS DE PACIENTE
// ===================================

export const pacienteService = {
  listar: (params: any = {}): Promise<PaginatedResponse<Paciente>> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return apiClient.get<PaginatedResponse<Paciente>>(
      `/api/pacientes?${searchParams.toString()}`
    );
  },

  buscarPorId: (id: string): Promise<Paciente> => {
    return apiClient.get<Paciente>(`/api/pacientes/${id}`);
  },

  buscarPorCpf: (cpf: string): Promise<Paciente> => {
    return apiClient.get<Paciente>(`/api/pacientes/cpf/${cpf}`);
  },

  buscarPorCartaoSus: (cartao: string): Promise<Paciente> => {
    return apiClient.get<Paciente>(`/api/pacientes/cartao-sus/${cartao}`);
  },

  obterHistorico: (id: string): Promise<any> => {
    return apiClient.get<any>(`/api/pacientes/${id}/historico`);
  },

  criar: (data: CriarPacienteRequest): Promise<Paciente> => {
    return apiClient.post<Paciente>('/api/pacientes', data);
  },

  criarCompleto: (data: any): Promise<Paciente> => {
    return apiClient.post<Paciente>('/api/pacientes/completo', data);
  },

  atualizar: (id: string, data: any): Promise<Paciente> => {
    return apiClient.put<Paciente>(`/api/pacientes/${id}`, data);
  },

  deletar: (id: string): Promise<boolean> => {
    return apiClient.delete<boolean>(`/api/pacientes/${id}`);
  }
};

// ===================================
// SERVIÇOS DE MÉDICO
// ===================================

export const medicoService = {
  listar: (params: any = {}): Promise<PaginatedResponse<Medico>> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return apiClient.get<PaginatedResponse<Medico>>(
      `/api/medicos?${searchParams.toString()}`
    );
  },

  buscarPorId: (id: string): Promise<Medico> => {
    return apiClient.get<Medico>(`/api/medicos/${id}`);
  },

  buscarPorCrm: (crm: string): Promise<Medico> => {
    return apiClient.get<Medico>(`/api/medicos/crm/${crm}`);
  },

  buscarPorEspecialidade: (especialidade: string): Promise<Medico[]> => {
    return apiClient.get<Medico[]>(`/api/medicos/especialidade/${especialidade}`);
  },

  obterAgenda: (id: string, data: string): Promise<any> => {
    return apiClient.get<any>(`/api/medicos/${id}/agenda?data=${data}`);
  },

  obterEstatisticas: (id: string): Promise<any> => {
    return apiClient.get<any>(`/api/medicos/${id}/estatisticas`);
  },

  criar: (data: CriarMedicoRequest): Promise<Medico> => {
    return apiClient.post<Medico>('/api/medicos', data);
  },

  criarCompleto: (data: any): Promise<Medico> => {
    return apiClient.post<Medico>('/api/medicos/completo', data);
  },

  atualizar: (id: string, data: any): Promise<Medico> => {
    return apiClient.put<Medico>(`/api/medicos/${id}`, data);
  },

  deletar: (id: string): Promise<boolean> => {
    return apiClient.delete<boolean>(`/api/medicos/${id}`);
  }
};

// ===================================
// HOOKS CUSTOMIZADOS
// ===================================

export function usePessoas(params: BuscarPessoasParams = {}) {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPessoas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pessoaService.listar(params);
      setPessoas(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
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
    refetch: fetchPessoas
  };
}

export function useUsuarios(params: any = {}) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usuarioService.listar(params);
      setUsuarios(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
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
    refetch: fetchUsuarios
  };
}

export function usePacientes(params: any = {}) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pacienteService.listar(params);
      setPacientes(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, [JSON.stringify(params)]);

  return {
    pacientes,
    loading,
    error,
    refetch: fetchPacientes
  };
}

export function useMedicos(params: any = {}) {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await medicoService.listar(params);
      setMedicos(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicos();
  }, [JSON.stringify(params)]);

  return {
    medicos,
    loading,
    error,
    refetch: fetchMedicos
  };
}