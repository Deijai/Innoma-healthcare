// src/app/dashboard/users/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, UserPlus, X } from 'lucide-react';

// Componentes específicos
import { UserAccessForm } from '@/components/forms/UserAccessForm';
import { PersonSelector } from '@/components/forms/PersonSelector';
import { UserPermissions } from '@/components/forms/UserPermissions';
import { UserStatusCard } from '@/components/forms/UserStatusCard';
import { UserInfoCard } from '@/components/forms/UserInfoCard';

// Services e types
import { usuarioService, pessoaService, Pessoa, usePessoas } from '@/lib/api-services';
import { useToast } from '@/components/ui/Toast';

export interface UserFormData {
  pessoa_id?: string;
  usuario: string;
  senha: string;
  confirmar_senha: string;
  papel: string;
  ativo: boolean;
  unidades_acesso: string[];
  permissoes: string[];
  
  // Dados da pessoa (quando criar nova)
  criar_pessoa: boolean;
  pessoa_dados?: {
    nome: string;
    data_nascimento: string;
    sexo: 'M' | 'F' | 'O';
    cpf: string;
    telefone?: string;
    email?: string;
  };
}

export interface FormErrors {
  [key: string]: string;
}

export default function NewUserPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  // Verificar se há pessoa pré-selecionada via URL
  const preSelectedPersonId = searchParams?.get('pessoa_id');
  
  const [formData, setFormData] = useState<UserFormData>({
    pessoa_id: preSelectedPersonId || '',
    usuario: '',
    senha: '',
    confirmar_senha: '',
    papel: 'RECEPCIONISTA',
    ativo: true,
    unidades_acesso: [],
    permissoes: [],
    criar_pessoa: !preSelectedPersonId,
    pessoa_dados: {
      nome: '',
      data_nascimento: '',
      sexo: 'M',
      cpf: '',
      telefone: '',
      email: ''
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);
  
  // Estados para busca de pessoas
  const [searchTermPessoa, setSearchTermPessoa] = useState('');
  const [showPessoaSearch, setShowPessoaSearch] = useState(false);

  // Hook para carregar pessoas
  const { pessoas: pessoasEncontradas, loading: searchingPessoa } = usePessoas({
    search: searchTermPessoa && searchTermPessoa.length >= 3 ? searchTermPessoa : undefined,
    status: 'ATIVO',
    limit: 10
  });

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
          email: pessoa.email || ''
        }
      }));
      
      // Sugerir username baseado no nome
      const username = pessoa.nome.toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-z0-9.-]/g, '');
      
      setFormData(prev => ({ ...prev, usuario: username }));
      
    } catch (error) {
      console.error('Erro ao carregar pessoa:', error);
      toast.error('Erro ao carregar pessoa selecionada');
    }
  };

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
        email: ''
      }
    }));
  };

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
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{pessoaSelecionada.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    CPF: {pessoaSelecionada.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
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
            <UserAccessForm
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              currentUser={currentUser}
            />

            {/* Seletor de pessoa */}
            {!pessoaSelecionada && (
              <PersonSelector
                formData={formData}
                errors={errors}
                onInputChange={handleInputChange}
                onPersonDataChange={(field, value) => {
                  setFormData(prev => ({
                    ...prev,
                    pessoa_dados: {
                      ...prev.pessoa_dados!,
                      [field]: value
                    }
                  }));
                  
                  const errorKey = `pessoa_dados.${field}`;
                  if (errors[errorKey]) {
                    setErrors(prev => ({ ...prev, [errorKey]: '' }));
                  }
                }}
                onPersonSelect={(pessoa: Pessoa) => {
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
                      email: pessoa.email || ''
                    }
                  }));
                  
                  // Sugerir username
                  const username = pessoa.nome.toLowerCase()
                    .replace(/\s+/g, '.')
                    .replace(/[^a-z0-9.-]/g, '');
                  
                  setFormData(prev => ({ ...prev, usuario: username }));
                }}
                pessoasEncontradas={pessoasEncontradas}
                searchingPessoa={searchingPessoa}
                searchTermPessoa={searchTermPessoa}
                setSearchTermPessoa={setSearchTermPessoa}
                showPessoaSearch={showPessoaSearch}
                setShowPessoaSearch={setShowPessoaSearch}
              />
            )}

            {/* Permissões */}
            <UserPermissions
              formData={formData}
              onPermissionChange={(permission, checked) => {
                setFormData(prev => ({
                  ...prev,
                  permissoes: checked 
                    ? [...prev.permissoes, permission]
                    : prev.permissoes.filter(p => p !== permission)
                }));
              }}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <UserStatusCard
              ativo={formData.ativo}
              onToggle={(ativo) => handleInputChange('ativo', ativo)}
            />

            {/* Ações */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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

            {/* Informações */}
            <UserInfoCard
              papel={formData.papel}
              permissoes={formData.permissoes}
              pessoaSelecionada={pessoaSelecionada}
            />
          </div>
        </div>
      </form>
    </div>
  );
}