// src/app/dashboard/users/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  X,
  User,
  Mail,
  Phone,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Key,
  RefreshCw
} from 'lucide-react';

// Interfaces
interface Usuario {
  id: string;
  pessoa_id?: string;
  usuario: string;
  papel: string;
  ativo: boolean;
  unidades_acesso?: string[];
  permissoes?: string[];
  pessoa?: {
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
  };
}

interface EditUserFormData {
  usuario: string;
  senha: string;
  confirmar_senha: string;
  papel: string;
  ativo: boolean;
  permissoes: string[];
}

interface FormErrors {
  [key: string]: string;
}

export default function EditUserPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  
  // Estados principais
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<EditUserFormData>({
    usuario: '',
    senha: '',
    confirmar_senha: '',
    papel: 'RECEPCIONISTA',
    ativo: true,
    permissoes: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // Permissões disponíveis
  const [availablePermissions] = useState([
    'CADASTRAR_PACIENTE', 'EDITAR_PACIENTE', 'VISUALIZAR_PACIENTE', 'DELETAR_PACIENTE',
    'CADASTRAR_MEDICO', 'EDITAR_MEDICO', 'VISUALIZAR_MEDICO', 'DELETAR_MEDICO',
    'AGENDAR_CONSULTA', 'CANCELAR_CONSULTA', 'REALIZAR_ATENDIMENTO', 'VISUALIZAR_AGENDA',
    'PRESCREVER_MEDICAMENTO', 'SOLICITAR_EXAME', 'GERAR_RELATORIOS',
    'GERENCIAR_USUARIOS', 'CONFIGURAR_SISTEMA', 'GERENCIAR_UNIDADES',
    'VISUALIZAR_FINANCEIRO', 'GERENCIAR_ESTOQUE'
  ]);

  // Carregar dados do usuário
  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuário não encontrado');
        }
        throw new Error('Erro ao carregar dados do usuário');
      }

      const userData = await response.json();
      setUsuario(userData);
      
      // Preencher formulário com dados existentes
      setFormData({
        usuario: userData.usuario || '',
        senha: '',
        confirmar_senha: '',
        papel: userData.papel || 'RECEPCIONISTA',
        ativo: userData.ativo !== false,
        permissoes: userData.permissoes || []
      });

    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Erro ao carregar dados do usuário' });
    } finally {
      setLoading(false);
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

    // Validação de senha (apenas se alterando)
    if (changePassword) {
      if (!formData.senha) {
        newErrors.senha = 'Nova senha é obrigatória';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      setErrors({});

      // Preparar dados para envio
      const submitData: any = {
        usuario: formData.usuario.trim(),
        papel: formData.papel,
        ativo: formData.ativo,
        permissoes: formData.permissoes
      };

      // Incluir senha apenas se estiver alterando
      if (changePassword && formData.senha) {
        submitData.senha = formData.senha;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Subdomain': localStorage.getItem('selected_tenant') || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar usuário');
      }

      // Redirecionar para visualização do usuário
      router.push(`/dashboard/users/${userId}`);

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar usuário' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Handlers de mudança
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

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissoes: checked 
        ? [...prev.permissoes, permission]
        : prev.permissoes.filter(p => p !== permission)
    }));
  };

  // Função para definir permissões padrão baseadas no papel
  const setDefaultPermissions = (papel: string) => {
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

    const novasPermissoes = permissoesPorPapel[papel] || [];
    setFormData(prev => ({
      ...prev,
      permissoes: novasPermissoes
    }));
  };

  const formatCPF = (value: string) => {
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getSexoDisplay = (sexo: string) => {
    const map = { 'M': 'Masculino', 'F': 'Feminino', 'O': 'Outro' };
    return map[sexo as keyof typeof map] || sexo;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Carregando dados do usuário...</span>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Usuário não encontrado</h3>
              <p className="text-muted-foreground mb-6">
                O usuário que você está tentando editar não foi encontrado.
              </p>
              <Link href="/dashboard/users">
                <Button>Voltar à lista</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/users/${userId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Editar Usuário</h1>
            <p className="text-muted-foreground">
              Editando: {usuario.pessoa?.nome || usuario.usuario}
            </p>
          </div>
        </div>
        
        <Button onClick={loadUserData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Recarregar
        </Button>
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
            {/* Informações da pessoa vinculada */}
            {usuario.pessoa && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Pessoa Vinculada</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">{usuario.pessoa.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          CPF: {formatCPF(usuario.pessoa.cpf)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {getSexoDisplay(usuario.pessoa.sexo)} • 
                          Nascido em {new Date(usuario.pessoa.data_nascimento).toLocaleDateString('pt-BR')}
                        </p>
                        {usuario.pessoa.email && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{usuario.pessoa.email}</span>
                          </div>
                        )}
                        {usuario.pessoa.telefone && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{usuario.pessoa.telefone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-blue-600">
                        💡 Para alterar dados pessoais, acesse o <Link href={`/dashboard/people/${usuario.pessoa_id}/edit`} className="underline">cadastro da pessoa</Link>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      onChange={(e) => {
                        handleInputChange('papel', e.target.value);
                        setDefaultPermissions(e.target.value);
                      }}
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

                {/* Alterar senha */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-medium">Alterar Senha</h4>
                      <p className="text-xs text-muted-foreground">
                        Deixe em branco para manter a senha atual
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={changePassword}
                        onChange={(e) => {
                          setChangePassword(e.target.checked);
                          if (!e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              senha: '',
                              confirmar_senha: ''
                            }));
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {changePassword && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Nova senha *
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
                          Confirmar nova senha *
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
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permissões */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Permissões do Sistema</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultPermissions(formData.papel)}
                  >
                    Aplicar Padrão
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Selecione as permissões específicas para este usuário. Use "Aplicar Padrão" para definir as permissões típicas do papel selecionado.
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
                      <AlertCircle className="h-4 w-4" />
                      <span>Usuário não poderá fazer login</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações atuais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Atuais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs">{usuario.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Usuário atual:</span>
                  <span className="font-mono text-xs">{usuario.usuario}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Papel atual:</span>
                  <span className="text-xs">{usuario.papel}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`text-xs ${usuario.ativo ? 'text-green-600' : 'text-red-600'}`}>
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Permissões:</span>
                  <span className="text-xs">{usuario.permissoes?.length || 0} atribuídas</span>
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
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                
                <Link href={`/dashboard/users/${userId}`} className="block">
                  <Button variant="outline" className="w-full" type="button">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </Link>

                {usuario.pessoa_id && (
                  <div className="pt-3 border-t border-border">
                    <Link href={`/dashboard/people/${usuario.pessoa_id}/edit`} className="block">
                      <Button variant="outline" className="w-full" type="button" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        Editar Dados Pessoais
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações de ajuda */}
            <Card>
              <CardHeader>
                <CardTitle>Ajuda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Dicas de edição:</p>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• Altere apenas os campos necessários</li>
                      <li>• A senha só será alterada se você marcar a opção</li>
                      <li>• Permissões são específicas para cada usuário</li>
                      <li>• Dados pessoais devem ser editados no cadastro da pessoa</li>
                      <li>• Usuários inativos não conseguem fazer login</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações avançadas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Avançadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-orange-600 hover:text-orange-700" 
                  type="button"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Resetar Senha
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-yellow-600 hover:text-yellow-700" 
                  type="button"
                >
                  Bloquear Temporariamente
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}