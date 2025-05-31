// src/app/dashboard/users/new/page.tsx (ATUALIZADO)
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
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
  XCircle,
  Plus
} from 'lucide-react';
import { pessoaService, usuarioService, Pessoa } from '@/lib/api-services';
import { formatCPF } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface UsuarioFormData {
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
  pessoa_dados?: {
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
  };
}

interface FormErrors {
  [key: string]: string;
}

export default function NewUserPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  // Verificar se há pessoa pré-selecionada via URL
  const preSelectedPersonId = searchParams?.get('pessoa_id');
  
  const [formData, setFormData] = useState<UsuarioFormData>({
    pessoa_id: preSelectedPersonId || '',
    usuario: '',
    senha: '',
    confirmar_senha: '',
    papel: 'RECEPCIONISTA',
    ativo: true,
    unidades_acesso: [],
    permissoes: [],
    criar_pessoa: !preSelectedPersonId, // Se há pessoa pré-selecionada, não criar nova
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para busca de pessoas
  const [searchingPessoa, setSearchingPessoa] = useState(false);
  const [pessoasEncontradas, setPessoasEncontradas] = useState<Pessoa[]>([]);
  const [searchTermPessoa, setSearchTermPessoa] = useState('');
  const [showPessoaSearch, setShowPessoaSearch] = useState(false);
  const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);

  // Estados para permissões
  const [availablePermissions] = useState([
    'CADASTRAR_PACIENTE', 'EDITAR_PACIENTE', 'VISUALIZAR_PACIENTE', 'DELETAR_PACIENTE',
    'CADASTRAR_MEDICO', 'EDITAR_MEDICO', 'VISUALIZAR_MEDICO', 'DELETAR_MEDICO',
    'AGENDAR_CONSULTA', 'CANCELAR_CONSULTA', 'REALIZAR_ATENDIMENTO', 'VISUALIZAR_AGENDA',
    'PRESCREVER_MEDICAMENTO', 'SOLICITAR_EXAME', 'GERAR_RELATORIOS',
    'GERENCIAR_USUARIOS', 'CONFIGURAR_SISTEMA', 'GERENCIAR_UNIDADES',
    'VISUALIZAR_FINANCEIRO', 'GERENCIAR_ESTOQUE'
  ]);

  // Carregar pessoa pré-selecionada
  useEffect(() => {
    if (preSelectedPersonId) {
      loadPreSelectedPerson();
    }
  }, [preSelectedPersonId]);

  const loadPreSelectedPerson = async () => {
    if (!preSelectedPersonId) return;

    try {
      const pessoa = await pessoaService.buscarPorId(preSelectedPersonId);
      setPessoaSelecionada(pessoa);
      setFormData(prev => ({
        ...prev,
        pessoa_id: pessoa.id,
        criar_pessoa: false,
        pessoa_dados: {
          nome: pessoa.nome,
          data_nascimento: pessoa.data_nascimento.split('T')[0],
          sexo: pessoa.sexo,
          cpf: pessoa.cpf,
          telefone: pessoa.telefone || '',
          email: pessoa.email || '',
          endereco: pessoa.endereco || prev.pessoa_dados?.endereco
        }
      }));
      
      // Sugerir username baseado no nome
      const username = pessoa.nome.toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-z0-9.-]/g, '');
      
      setFormData(prev => ({
        ...prev,
        usuario: username
      }));
      
    } catch (error) {
      console.error('Erro ao carregar pessoa:', error);
      toast.error('Erro ao carregar pessoa selecionada');
    }
  };

  // Buscar pessoas existentes
  const searchPessoas = async (termo: string) => {
    if (!termo || termo.length < 3) return;
    
    try {
      setSearchingPessoa(true);
      
      const response = await pessoaService.listar({
        search: termo,
        limit: 10,
        status: 'ATIVO'
      });
      
      setPessoasEncontradas(response.data || []);
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
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.usuario)) {
      newErrors.usuario = 'Nome de usuário pode conter apenas letras, números, pontos, hífen e underscore';
    }

    // Validação de senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.senha !== formData.confirmar_senha) {
      newErrors.confirmar_senha = 'Senhas não coincidem';
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
      } else if (pessoa.nome.length < 2) {
        newErrors['pessoa_dados.nome'] = 'Nome deve ter pelo menos 2 caracteres';
      }

      if (!pessoa.cpf.trim()) {
        newErrors['pessoa_dados.cpf'] = 'CPF é obrigatório';
      } else if (pessoa.cpf.replace(/\D/g, '').length !== 11) {
        newErrors['pessoa_dados.cpf'] = 'CPF deve ter 11 dígitos';
      }

      if (!pessoa.data_nascimento) {
        newErrors['pessoa_dados.data_nascimento'] = 'Data de nascimento é obrigatória';
      } else {
        const dataNasc = new Date(pessoa.data_nascimento);
        if (dataNasc > new Date()) {
          newErrors['pessoa_dados.data_nascimento'] = 'Data de nascimento não pode ser futura';
        }
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

      // Preparar dados para envio
      const submitData: any = {
        usuario: formData.usuario.trim(),
        senha: formData.senha,
        papel: formData.papel,
        ativo: formData.ativo,
        unidades_acesso: formData.unidades_acesso,
        permissoes: formData.permissoes
      };

      // Incluir pessoa_id se não criar nova pessoa
      if (!formData.criar_pessoa && formData.pessoa_id) {
        submitData.pessoa_id = formData.pessoa_id;
      }

      // Se criando usuário completo, incluir dados da pessoa
      if (formData.criar_pessoa) {
        submitData.dadosPessoa = formData.pessoa_dados;
      }

      const result = await usuarioService.criar(submitData);
      
      toast.success('Usuário criado com sucesso!');
      
      // Redirecionar para visualização do usuário
      router.push(`/dashboard/users/${result.id}`);

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao criar usuário';
      setErrors({ general: errorMessage });
      toast.error('Erro ao criar usuário', errorMessage);
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
    setPessoaSelecionada(pessoa);
    setFormData(prev => ({
      ...prev,
      pessoa_id: pessoa.id,
      pessoa_dados: {
        nome: pessoa.nome,
        data_nascimento: pessoa.data_nascimento.split('T')[0],
        sexo: pessoa.sexo,
        cpf: pessoa.cpf,
        telefone: pessoa.telefone || '',
        email: pessoa.email || '',
        endereco: pessoa.endereco || prev.pessoa_dados?.endereco
      }
    }));
    setShowPessoaSearch(false);
    setSearchTermPessoa('');
    setPessoasEncontradas([]);
    
    // Sugerir username baseado no nome
    const username = pessoa.nome.toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.-]/g, '');
    
    setFormData(prev => ({
      ...prev,
      usuario: username
    }));
  };

  const clearSelectedPessoa = () => {
    setPessoaSelecionada(null);
    setFormData(prev => ({
      ...prev,
      pessoa_id: '',
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
    }));
  };

  // Formatação de CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Autocompletar permissões baseado no papel
  useEffect(() => {
    const permissoesPorPapel: Record<string, string[]> = {
      'ADMIN': availablePermissions,
      'MEDICO': [
        'VISUALIZAR_PACIENTE', 'EDITAR_PACIENTE',
        'AGENDAR_CONSULTA', 'CANCELAR_CONSULTA', 'REALIZAR_ATENDIMENTO', 'VISUALIZAR_AGENDA',
        'PRESCREVER_MEDICAMENTO', 'SOLICITAR_EXAME'
      ],
      'ENFERMEIRO': [
        'VISUALIZAR_PACIENTE', 'EDITAR_PACIENTE',
        'AGENDAR_CONSULTA', 'VISUALIZAR_AGENDA'
      ],
      'RECEPCIONISTA': [
        'CADASTRAR_PACIENTE', 'EDITAR_PACIENTE', 'VISUALIZAR_PACIENTE',
        'AGENDAR_CONSULTA', 'CANCELAR_CONSULTA', 'VISUALIZAR_AGENDA'
      ],
      'FARMACEUTICO': [
        'VISUALIZAR_PACIENTE', 'GERENCIAR_ESTOQUE'
      ],
      'LABORATORISTA': [
        'VISUALIZAR_PACIENTE', 'GERENCIAR_ESTOQUE'
      ],
      'GESTOR': [
        'VISUALIZAR_PACIENTE', 'VISUALIZAR_MEDICO', 'VISUALIZAR_AGENDA',
        'GERAR_RELATORIOS', 'VISUALIZAR_FINANCEIRO'
      ]
    };

    if (formData.papel && permissoesPorPapel[formData.papel]) {
      setFormData(prev => ({
        ...prev,
        permissoes: permissoesPorPapel[formData.papel]
      }));
    }
  }, [formData.papel]);

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
            <h1 className="text-3xl font-bold">Novo Usuário</h1>
            <p className="text-muted-foreground">
              {pessoaSelecionada ? 
                `Criando usuário para: ${pessoaSelecionada.nome}` :
                'Crie um novo usuário do sistema'
              }
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

      {/* Pessoa pré-selecionada */}
      {pessoaSelecionada && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{pessoaSelecionada.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    CPF: {formatCPF(pessoaSelecionada.cpf)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSelectedPessoa}
              >
                <X className="h-4 w-4 mr-2" />
                Trocar Pessoa
              </Button>
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
                      Senha *
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
                      Confirmar senha *
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
            {!pessoaSelecionada && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Selecionar Pessoa</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="radio"
                          name="pessoa_type"
                          checked={!formData.criar_pessoa}
                          onChange={() => handleInputChange('criar_pessoa', false)}
                        />
                        <span>Pessoa existente</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="radio"
                          name="pessoa_type"
                          checked={formData.criar_pessoa}
                          onChange={() => handleInputChange('criar_pessoa', true)}
                        />
                        <span>Criar nova pessoa</span>
                      </label>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!formData.criar_pessoa ? (
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

                      {errors.pessoa_id && (
                        <p className="text-red-600 text-xs">{errors.pessoa_id}</p>
                      )}

                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-3">
                          Não encontrou a pessoa? 
                        </p>
                        <Link href="/dashboard/people/new">
                          <Button type="button" variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Cadastrar Nova Pessoa
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    // Formulário de nova pessoa (versão compacta)
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
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

                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Dica:</strong> Você pode completar as informações de endereço depois de criar o usuário.
                        </p>
                      </div>
                    </div>
                  )}
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
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    As permissões são preenchidas automaticamente baseadas no papel selecionado, mas você pode personalizar.
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
                      Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Criar Usuário
                    </>
                  )}
                </Button>
                
                <Link href="/dashboard/users" className="block">
                  <Button variant="outline" className="w-full" type="button">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </Link>
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
                    <p className="font-medium text-foreground">Fluxo de criação:</p>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• {pessoaSelecionada ? 'Pessoa já selecionada' : 'Selecione ou crie uma pessoa'}</li>
                      <li>• Configure dados de acesso (usuário/senha)</li>
                      <li>• Defina papel e permissões</li>
                      <li>• Usuário ficará ativo por padrão</li>
                      <li>• Senhas devem ter pelo menos 6 caracteres</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview do papel */}
            {formData.papel && (
              <Card>
                <CardHeader>
                  <CardTitle>Papel Selecionado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-medium">{formData.papel}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.permissoes.length} permissões atribuídas
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}