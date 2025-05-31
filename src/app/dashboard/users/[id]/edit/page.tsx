// src/app/dashboard/users/new/page.tsx e src/app/dashboard/users/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  UserPlus,
  Search,
  XCircle
} from 'lucide-react';

// Interfaces
interface Pessoa {
  id?: string;
  nome: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'O';
  cpf: string;
  telefone?: string;
  email?: string;
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

interface UsuarioFormData {
  // Dados do usuário
  pessoa_id?: string;
  usuario: string;
  senha: string;
  confirmar_senha: string;
  papel: string;
  ativo: boolean;
  unidades_acesso: string[];
  permissoes: string[];
  
  // Dados da pessoa (quando não vincular a existente)
  criar_pessoa: boolean;
  pessoa_dados?: Pessoa;
}

interface FormErrors {
  [key: string]: string;
}

// Props do componente
interface UserFormProps {
  userId?: string; // undefined para criação, string para edição
}

export default function UserForm({ userId }: UserFormProps) {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const isEditing = !!userId;
  
  // Estados principais
  const [formData, setFormData] = useState<UsuarioFormData>({
    pessoa_id: '',
    usuario: '',
    senha: '',
    confirmar_senha: '',
    papel: 'RECEPCIONISTA',
    ativo: true,
    unidades_acesso: [],
    permissoes: [],
    criar_pessoa: true,
    pessoa_dados: {
      nome: '',
      data_nascimento: '',
      sexo: 'M',
      cpf: '',
      telefone: '',
      email: '',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      }
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para busca de pessoas
  const [searchingPessoa, setSearchingPessoa] = useState(false);
  const [pessoasEncontradas, setPessoasEncontradas] = useState<Pessoa[]>([]);
  const [searchTermPessoa, setSearchTermPessoa] = useState('');
  const [showPessoaSearch, setShowPessoaSearch] = useState(false);

  // Estados para permissões
  const [availablePermissions] = useState([
    'CADASTRAR_PACIENTE', 'EDITAR_PACIENTE', 'VISUALIZAR_PACIENTE', 'DELETAR_PACIENTE',
    'CADASTRAR_MEDICO', 'EDITAR_MEDICO', 'VISUALIZAR_MEDICO', 'DELETAR_MEDICO',
    'AGENDAR_CONSULTA', 'CANCELAR_CONSULTA', 'REALIZAR_ATENDIMENTO', 'VISUALIZAR_AGENDA',
    'PRESCREVER_MEDICAMENTO', 'SOLICITAR_EXAME', 'GERAR_RELATORIOS',
    'GERENCIAR_USUARIOS', 'CONFIGURAR_SISTEMA', 'GERENCIAR_UNIDADES',
    'VISUALIZAR_FINANCEIRO', 'GERENCIAR_ESTOQUE'
  ]);

  // Caregar dados do usuário para edição
  useEffect(() => {
    if (isEditing) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoadingData(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar dados do usuário');

      const userData = await response.json();
      
      // Preencher formulário com dados existentes
      setFormData(prev => ({
        ...prev,
        pessoa_id: userData.pessoa_id || '',
        usuario: userData.usuario || '',
        senha: '', // Não carregar senha existente
        confirmar_senha: '',
        papel: userData.papel || 'RECEPCIONISTA',
        ativo: userData.ativo !== false,
        unidades_acesso: userData.unidades_acesso || [],
        permissoes: userData.permissoes || [],
        criar_pessoa: false, // Para edição, não criar nova pessoa
        pessoa_dados: userData.pessoa ? {
          id: userData.pessoa_id,
          nome: userData.pessoa.nome || '',
          data_nascimento: userData.pessoa.data_nascimento ? userData.pessoa.data_nascimento.split('T')[0] : '',
          sexo: userData.pessoa.sexo || 'M',
          cpf: userData.pessoa.cpf || '',
          telefone: userData.pessoa.telefone || '',
          email: userData.pessoa.email || '',
          endereco: userData.pessoa.endereco || {}
        } : prev.pessoa_dados
      }));

    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setErrors({ general: 'Erro ao carregar dados do usuário' });
    } finally {
      setLoadingData(false);
    }
  };

  // Buscar pessoas existentes
  const searchPessoas = async (termo: string) => {
    if (!termo || termo.length < 3) return;
    
    try {
      setSearchingPessoa(true);
      
      const response = await fetch(`/api/pessoas?search=${encodeURIComponent(termo)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPessoasEncontradas(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar pessoas:', error);
    } finally {
      setSearchingPessoa(false);
    }
  };

  // Debounce para busca de pessoas
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTermPessoa && !formData.criar_pessoa) {
        searchPessoas(searchTermPessoa);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTermPessoa, formData.criar_pessoa]);

  // Validações
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validação do usuário
    if (!formData.usuario.trim()) {
      newErrors.usuario = 'Nome de usuário é obrigatório';
    } else if (formData.usuario.length < 3) {
      newErrors.usuario = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }

    // Validação de senha (apenas para criação ou se informada)
    if (!isEditing || formData.senha) {
      if (!formData.senha) {
        newErrors.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < 6) {
        newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (formData.senha !== formData.confirmar_senha) {
        newErrors.confirmar_senha = 'Senhas não coincidem';
      }
    }

    // Validação de papel
    if (!formData.papel) {
      newErrors.papel = 'Papel é obrigatório';
    }

    // Validação da pessoa
    if (formData.criar_pessoa && formData.pessoa_dados) {
      const pessoa = formData.pessoa_dados;
      
      if (!pessoa.nome.trim()) {
        newErrors['pessoa_dados.nome'] = 'Nome é obrigatório';
      }

      if (!pessoa.cpf.trim()) {
        newErrors['pessoa_dados.cpf'] = 'CPF é obrigatório';
      } else if (pessoa.cpf.replace(/\D/g, '').length !== 11) {
        newErrors['pessoa_dados.cpf'] = 'CPF deve ter 11 dígitos';
      }

      if (!pessoa.data_nascimento) {
        newErrors['pessoa_dados.data_nascimento'] = 'Data de nascimento é obrigatória';
      }

      if (pessoa.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pessoa.email)) {
        newErrors['pessoa_dados.email'] = 'Email inválido';
      }
    } else if (!formData.criar_pessoa && !formData.pessoa_id) {
      newErrors.pessoa_id = 'Selecione uma pessoa ou crie uma nova';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      const url = isEditing ? `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}` : `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`;
      const method = isEditing ? 'PUT' : 'POST';

      // Preparar dados para envio
      const submitData: any = {
        usuario: formData.usuario.trim(),
        papel: formData.papel,
        ativo: formData.ativo,
        unidades_acesso: formData.unidades_acesso,
        permissoes: formData.permissoes
      };

      // Incluir senha apenas se fornecida
      if (formData.senha) {
        submitData.senha = formData.senha;
      }

      // Incluir pessoa_id se não criar nova pessoa
      if (!formData.criar_pessoa && formData.pessoa_id) {
        submitData.pessoa_id = formData.pessoa_id;
      }

      // Se criando usuário completo, usar endpoint específico
      if (!isEditing && formData.criar_pessoa) {
        submitData.dadosPessoa = formData.pessoa_dados;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar usuário');
      }

      const result = await response.json();
      
      // Redirecionar para visualização do usuário
      router.push(`/dashboard/users/${result.id || userId}`);

    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Erro desconhecido ao salvar usuário' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers de mudança de dados
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePessoaDataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      pessoa_dados: {
        ...prev.pessoa_dados!,
        [field]: value
      }
    }));
    
    // Limpar erro do campo
    const errorKey = `pessoa_dados.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleEnderecoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      pessoa_dados: {
        ...prev.pessoa_dados!,
        endereco: {
          ...prev.pessoa_dados!.endereco,
          [field]: value
        }
      }
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissoes: checked 
        ? [...prev.permissoes, permission]
        : prev.permissoes.filter(p => p !== permission)
    }));
  };

  const selectPessoa = (pessoa: Pessoa) => {
    setFormData(prev => ({
      ...prev,
      pessoa_id: pessoa.id!,
      pessoa_dados: pessoa
    }));
    setShowPessoaSearch(false);
    setSearchTermPessoa('');
    setPessoasEncontradas([]);
  };

  // Formatação de CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (loadingData) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Carregando dados do usuário...</span>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Atualize as informações do usuário' : 'Crie um novo usuário do sistema'}
            </p>
          </div>
        </div>
      </div>

      {/* Erro geral */}
      {errors.general && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{errors.general}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados de acesso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Dados de Acesso</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Nome de usuário *
                    </label>
                    <input
                      type="text"
                      value={formData.usuario}
                      onChange={(e) => handleInputChange('usuario', e.target.value.toLowerCase())}
                      className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                        errors.usuario ? 'border-red-500' : 'border-input'
                      }`}
                      placeholder="usuario.exemplo"
                    />
                    {errors.usuario && (
                      <p className="text-red-600 text-xs mt-1">{errors.usuario}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Papel *
                    </label>
                    <select
                      value={formData.papel}
                      onChange={(e) => handleInputChange('papel', e.target.value)}
                      className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                        errors.papel ? 'border-red-500' : 'border-input'
                      }`}
                    >
                      <option value="RECEPCIONISTA">Recepcionista</option>
                      <option value="ENFERMEIRO">Enfermeiro</option>
                      <option value="MEDICO">Médico</option>
                      <option value="FARMACEUTICO">Farmacêutico</option>
                      <option value="LABORATORISTA">Laboratorista</option>
                      <option value="GESTOR">Gestor</option>
                      {currentUser?.papel === 'ADMIN' && (
                        <option value="ADMIN">Administrador</option>
                      )}
                    </select>
                    {errors.papel && (
                      <p className="text-red-600 text-xs mt-1">{errors.papel}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {isEditing ? 'Nova senha (deixe vazio para manter)' : 'Senha *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.senha}
                        onChange={(e) => handleInputChange('senha', e.target.value)}
                        className={`w-full px-3 py-2 pr-10 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                          errors.senha ? 'border-red-500' : 'border-input'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.senha && (
                      <p className="text-red-600 text-xs mt-1">{errors.senha}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {isEditing ? 'Confirmar nova senha' : 'Confirmar senha *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmar_senha}
                        onChange={(e) => handleInputChange('confirmar_senha', e.target.value)}
                        className={`w-full px-3 py-2 pr-10 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                          errors.confirmar_senha ? 'border-red-500' : 'border-input'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmar_senha && (
                      <p className="text-red-600 text-xs mt-1">{errors.confirmar_senha}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados da pessoa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Dados Pessoais</span>
                  </div>
                  
                  {!isEditing && (
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="radio"
                          name="pessoa_type"
                          checked={formData.criar_pessoa}
                          onChange={() => handleInputChange('criar_pessoa', true)}
                        />
                        <span>Criar nova pessoa</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="radio"
                          name="pessoa_type"
                          checked={!formData.criar_pessoa}
                          onChange={() => handleInputChange('criar_pessoa', false)}
                        />
                        <span>Vincular pessoa existente</span>
                      </label>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!formData.criar_pessoa && !isEditing ? (
                  // Busca de pessoa existente
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                          type="text"
                          value={searchTermPessoa}
                          onChange={(e) => {
                            setSearchTermPessoa(e.target.value);
                            setShowPessoaSearch(true);
                          }}
                          className="w-full pl-10 pr-4 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                          placeholder="Buscar por nome ou CPF..."
                        />
                      </div>
                      
                      {searchingPessoa && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>

                    {showPessoaSearch && pessoasEncontradas.length > 0 && (
                      <Card>
                        <CardContent className="p-0">
                          <div className="max-h-60 overflow-y-auto">
                            {pessoasEncontradas.map((pessoa) => (
                              <button
                                key={pessoa.id}
                                type="button"
                                onClick={() => selectPessoa(pessoa)}
                                className="w-full p-4 text-left hover:bg-accent border-b border-border last:border-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{pessoa.nome}</p>
                                    <p className="text-sm text-muted-foreground">
                                      CPF: {formatCPF(pessoa.cpf)}
                                    </p>
                                  </div>
                                  <div className="text-right text-sm text-muted-foreground">
                                    {pessoa.email && <p>{pessoa.email}</p>}
                                    {pessoa.telefone && <p>{pessoa.telefone}</p>}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {formData.pessoa_id && formData.pessoa_dados && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{formData.pessoa_dados.nome}</h4>
                              <p className="text-sm text-muted-foreground">
                                CPF: {formatCPF(formData.pessoa_dados.cpf)}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                handleInputChange('pessoa_id', '');
                                handleInputChange('pessoa_dados', {
                                  nome: '', data_nascimento: '', sexo: 'M', cpf: '', telefone: '', email: '', endereco: {}
                                });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {errors.pessoa_id && (
                      <p className="text-red-600 text-xs">{errors.pessoa_id}</p>
                    )}
                  </div>
                ) : (
                  // Formulário de pessoa
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Nome completo *
                        </label>
                        <input
                          type="text"
                          value={formData.pessoa_dados?.nome || ''}
                          onChange={(e) => handlePessoaDataChange('nome', e.target.value)}
                          className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                            errors['pessoa_dados.nome'] ? 'border-red-500' : 'border-input'
                          }`}
                          placeholder="Nome completo"
                          disabled={!formData.criar_pessoa && isEditing}
                        />
                        {errors['pessoa_dados.nome'] && (
                          <p className="text-red-600 text-xs mt-1">{errors['pessoa_dados.nome']}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          CPF *
                        </label>
                        <input
                          type="text"
                          value={formatCPF(formData.pessoa_dados?.cpf || '')}
                          onChange={(e) => handlePessoaDataChange('cpf', e.target.value.replace(/\D/g, ''))}
                          className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                            errors['pessoa_dados.cpf'] ? 'border-red-500' : 'border-input'
                          }`}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          disabled={!formData.criar_pessoa && isEditing}
                        />
                        {errors['pessoa_dados.cpf'] && (
                          <p className="text-red-600 text-xs mt-1">{errors['pessoa_dados.cpf']}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Data de nascimento *
                        </label>
                        <input
                          type="date"
                          value={formData.pessoa_dados?.data_nascimento || ''}
                          onChange={(e) => handlePessoaDataChange('data_nascimento', e.target.value)}
                          className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                            errors['pessoa_dados.data_nascimento'] ? 'border-red-500' : 'border-input'
                          }`}
                          disabled={!formData.criar_pessoa && isEditing}
                        />
                        {errors['pessoa_dados.data_nascimento'] && (
                          <p className="text-red-600 text-xs mt-1">{errors['pessoa_dados.data_nascimento']}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Sexo *
                        </label>
                        <select
                          value={formData.pessoa_dados?.sexo || 'M'}
                          onChange={(e) => handlePessoaDataChange('sexo', e.target.value)}
                          className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                          disabled={!formData.criar_pessoa && isEditing}
                        >
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                          <option value="O">Outro</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.pessoa_dados?.email || ''}
                          onChange={(e) => handlePessoaDataChange('email', e.target.value)}
                          className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                            errors['pessoa_dados.email'] ? 'border-red-500' : 'border-input'
                          }`}
                          placeholder="email@exemplo.com"
                        />
                        {errors['pessoa_dados.email'] && (
                          <p className="text-red-600 text-xs mt-1">{errors['pessoa_dados.email']}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          value={formData.pessoa_dados?.telefone || ''}
                          onChange={(e) => handlePessoaDataChange('telefone', e.target.value)}
                          className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Endereço</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium mb-2 block">Logradouro</label>
                          <input
                            type="text"
                            value={formData.pessoa_dados?.endereco?.logradouro || ''}
                            onChange={(e) => handleEnderecoChange('logradouro', e.target.value)}
                            className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                            placeholder="Rua, Avenida, etc."
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Número</label>
                          <input
                            type="text"
                            value={formData.pessoa_dados?.endereco?.numero || ''}
                            onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                            className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                            placeholder="123"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Complemento</label>
                          <input
                            type="text"
                            value={formData.pessoa_dados?.endereco?.complemento || ''}
                            onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                            className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                            placeholder="Apto, Bloco, etc."
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Bairro</label>
                          <input
                            type="text"
                            value={formData.pessoa_dados?.endereco?.bairro || ''}
                            onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                            className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                            placeholder="Centro"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Cidade</label>
                          <input
                            type="text"
                            value={formData.pessoa_dados?.endereco?.cidade || ''}
                            onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                            className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                            placeholder="São Paulo"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Estado</label>
                          <select
                            value={formData.pessoa_dados?.endereco?.estado || ''}
                            onChange={(e) => handleEnderecoChange('estado', e.target.value)}
                            className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                          >
                            <option value="">Selecione</option>
                            <option value="AC">Acre</option>
                            <option value="AL">Alagoas</option>
                            <option value="AP">Amapá</option>
                            <option value="AM">Amazonas</option>
                            <option value="BA">Bahia</option>
                            <option value="CE">Ceará</option>
                            <option value="DF">Distrito Federal</option>
                            <option value="ES">Espírito Santo</option>
                            <option value="GO">Goiás</option>
                            <option value="MA">Maranhão</option>
                            <option value="MT">Mato Grosso</option>
                            <option value="MS">Mato Grosso do Sul</option>
                            <option value="MG">Minas Gerais</option>
                            <option value="PA">Pará</option>
                            <option value="PB">Paraíba</option>
                            <option value="PR">Paraná</option>
                            <option value="PE">Pernambuco</option>
                            <option value="PI">Piauí</option>
                            <option value="RJ">Rio de Janeiro</option>
                            <option value="RN">Rio Grande do Norte</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="RO">Rondônia</option>
                            <option value="RR">Roraima</option>
                            <option value="SC">Santa Catarina</option>
                            <option value="SP">São Paulo</option>
                            <option value="SE">Sergipe</option>
                            <option value="TO">Tocantins</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">CEP</label>
                          <input
                            type="text"
                            value={formData.pessoa_dados?.endereco?.cep || ''}
                            onChange={(e) => handleEnderecoChange('cep', e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'))}
                            className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                            placeholder="00000-000"
                            maxLength={9}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Permissões */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Permissões do Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Selecione as permissões que este usuário terá no sistema.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map((permission) => (
                      <label key={permission} className="flex items-center space-x-3 p-3 border border-input rounded-md hover:bg-accent cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissoes.includes(permission)}
                          onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                          className="rounded border-border"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            {permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {formData.permissoes.length > 0 && (
                    <div className="mt-4 p-3 bg-accent rounded-md">
                      <p className="text-sm font-medium mb-2">Permissões selecionadas ({formData.permissoes.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.permissoes.map((permission) => (
                          <span key={permission} className="inline-flex items-center px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                            {permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                            <button
                              type="button"
                              onClick={() => handlePermissionChange(permission, false)}
                              className="ml-2 hover:bg-primary-foreground hover:text-primary rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Usuário ativo</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => handleInputChange('ativo', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {formData.ativo ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Usuário poderá fazer login</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>Usuário não poderá fazer login</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditing ? 'Salvando...' : 'Criando...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
                    </>
                  )}
                </Button>
                
                <Link href="/dashboard/users" className="block">
                  <Button variant="outline" className="w-full" type="button">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </Link>

                {isEditing && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium text-sm mb-3">Ações Avançadas</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full text-orange-600 hover:text-orange-700" type="button">
                        Resetar Senha
                      </Button>
                      <Button variant="outline" size="sm" className="w-full text-yellow-600 hover:text-yellow-700" type="button">
                        Bloquear Temporariamente
                      </Button>
                      <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700" type="button">
                        Desativar Conta
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Dicas importantes:</p>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• Senhas devem ter pelo menos 6 caracteres</li>
                      <li>• Usuários inativos não conseguem fazer login</li>
                      <li>• Permissões podem ser alteradas posteriormente</li>
                      <li>• Dados pessoais seguem a LGPD</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}