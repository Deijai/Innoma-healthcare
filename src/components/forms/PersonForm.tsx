// src/components/forms/PersonForm.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, TextInput, Select, StatusBadge } from './FormComponents';
import { User, MapPin, Save, X, UserPlus } from 'lucide-react';
import { Pessoa, CriarPessoaRequest, AtualizarPessoaRequest } from '@/lib/api-services';
import { formatCPF, isValidCPF, isValidEmail, cn } from '@/lib/utils';

interface PersonFormProps {
  initialData?: Pessoa;
  onSubmit: (data: CriarPessoaRequest | AtualizarPessoaRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
  title?: string;
  submitButtonText?: string;
  showEnderecoSection?: boolean;
  className?: string;
}

interface FormData {
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'O';
  email: string;
  telefone: string;
  status: 'ATIVO' | 'INATIVO';
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

interface FormErrors {
  [key: string]: string;
}

export function PersonForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
  title,
  submitButtonText,
  showEnderecoSection = true,
  className
}: PersonFormProps) {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cpf: '',
    data_nascimento: '',
    sexo: 'M',
    email: '',
    telefone: '',
    status: 'ATIVO',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Preencher formulário com dados iniciais
  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || '',
        cpf: initialData.cpf || '',
        data_nascimento: initialData.data_nascimento ? initialData.data_nascimento.split('T')[0] : '',
        sexo: initialData.sexo || 'M',
        email: initialData.email || '',
        telefone: initialData.telefone || '',
        status: initialData.status || 'ATIVO',
        endereco: {
          logradouro: initialData.endereco?.logradouro || '',
          numero: initialData.endereco?.numero || '',
          complemento: initialData.endereco?.complemento || '',
          bairro: initialData.endereco?.bairro || '',
          cidade: initialData.endereco?.cidade || '',
          estado: initialData.endereco?.estado || '',
          cep: initialData.endereco?.cep || ''
        }
      });
    }
  }, [initialData]);

  // Estados do Brasil
  const estados = [
    { value: '', label: 'Selecione o estado' },
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];

  // Validações
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!isValidCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    // Data de nascimento
    if (!formData.data_nascimento) {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    } else {
      const dataNasc = new Date(formData.data_nascimento);
      if (dataNasc > new Date()) {
        newErrors.data_nascimento = 'Data de nascimento não pode ser futura';
      }
    }

    // Email (opcional, mas se preenchido deve ser válido)
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // CEP (se preenchido, deve ter formato válido)
    if (formData.endereco.cep && !/^\d{5}-?\d{3}$/.test(formData.endereco.cep)) {
      newErrors['endereco.cep'] = 'CEP deve ter formato 00000-000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleEnderecoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [field]: value
      }
    }));

    // Limpar erro do campo
    const errorKey = `endereco.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleCPFChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cpf: numbers }));
    
    if (errors.cpf) {
      setErrors(prev => ({ ...prev, cpf: '' }));
    }
  };

  const handleCEPChange = (value: string) => {
    const formatted = value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
    handleEnderecoChange('cep', formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const submitData: CriarPessoaRequest | AtualizarPessoaRequest = {
        nome: formData.nome.trim(),
        cpf: formData.cpf,
        data_nascimento: formData.data_nascimento,
        sexo: formData.sexo,
        email: formData.email.trim() || undefined,
        telefone: formData.telefone.trim() || undefined,
        endereco: showEnderecoSection && Object.values(formData.endereco).some(v => v.trim()) 
          ? formData.endereco 
          : undefined
      };

      if (isEditing) {
        (submitData as AtualizarPessoaRequest).status = formData.status;
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro no formulário:', error);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Dados Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Field label="Nome completo" error={errors.nome} required>
                      <TextInput
                        value={formData.nome}
                        onChange={(value) => handleInputChange('nome', value)}
                        placeholder="Nome completo"
                        error={!!errors.nome}
                      />
                    </Field>
                  </div>

                  <Field label="CPF" error={errors.cpf} required>
                    <TextInput
                      value={formatCPF(formData.cpf)}
                      onChange={handleCPFChange}
                      placeholder="000.000.000-00"
                      error={!!errors.cpf}
                    />
                  </Field>

                  <Field label="Data de nascimento" error={errors.data_nascimento} required>
                    <input
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                      className={cn(
                        'w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md',
                        errors.data_nascimento ? 'border-red-500' : 'border-input'
                      )}
                    />
                  </Field>

                  <Field label="Sexo" required>
                    <Select
                      value={formData.sexo}
                      onChange={(value) => handleInputChange('sexo', value)}
                      options={[
                        { value: 'M', label: 'Masculino' },
                        { value: 'F', label: 'Feminino' },
                        { value: 'O', label: 'Outro' }
                      ]}
                    />
                  </Field>

                  <Field label="Email" error={errors.email}>
                    <TextInput
                      type="email"
                      value={formData.email}
                      onChange={(value) => handleInputChange('email', value)}
                      placeholder="email@exemplo.com"
                      error={!!errors.email}
                    />
                  </Field>

                  <Field label="Telefone">
                    <TextInput
                      type="tel"
                      value={formData.telefone}
                      onChange={(value) => handleInputChange('telefone', value)}
                      placeholder="(11) 99999-9999"
                    />
                  </Field>
                </div>
              </CardContent>
            </Card>

            {/* Endereço (opcional) */}
            {showEnderecoSection && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Endereço</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Field label="Logradouro">
                        <TextInput
                          value={formData.endereco.logradouro}
                          onChange={(value) => handleEnderecoChange('logradouro', value)}
                          placeholder="Rua, Avenida, etc."
                        />
                      </Field>
                    </div>

                    <Field label="Número">
                      <TextInput
                        value={formData.endereco.numero}
                        onChange={(value) => handleEnderecoChange('numero', value)}
                        placeholder="123"
                      />
                    </Field>

                    <Field label="Complemento">
                      <TextInput
                        value={formData.endereco.complemento}
                        onChange={(value) => handleEnderecoChange('complemento', value)}
                        placeholder="Apt, Bloco, etc."
                      />
                    </Field>

                    <Field label="Bairro">
                      <TextInput
                        value={formData.endereco.bairro}
                        onChange={(value) => handleEnderecoChange('bairro', value)}
                        placeholder="Nome do bairro"
                      />
                    </Field>

                    <Field label="CEP" error={errors['endereco.cep']}>
                      <TextInput
                        value={formData.endereco.cep}
                        onChange={handleCEPChange}
                        placeholder="00000-000"
                        error={!!errors['endereco.cep']}
                      />
                    </Field>

                    <Field label="Cidade">
                      <TextInput
                        value={formData.endereco.cidade}
                        onChange={(value) => handleEnderecoChange('cidade', value)}
                        placeholder="Nome da cidade"
                      />
                    </Field>

                    <Field label="Estado">
                      <Select
                        value={formData.endereco.estado}
                        onChange={(value) => handleEnderecoChange('estado', value)}
                        options={estados}
                      />
                    </Field>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status (apenas na edição) */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status da pessoa</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.status === 'ATIVO'}
                          onChange={(e) => handleInputChange('status', e.target.checked ? 'ATIVO' : 'INATIVO')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    <div className="text-center">
                      <StatusBadge status={formData.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>{title || (isEditing ? 'Atualizar Pessoa' : 'Cadastrar Pessoa')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isEditing ? 'Atualizando...' : 'Cadastrando...'}
                    </>
                  ) : (
                    <>
                      {isEditing ? (
                        <Save className="h-4 w-4 mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {submitButtonText || (isEditing ? 'Atualizar Pessoa' : 'Cadastrar Pessoa')}
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </CardContent>
            </Card>

            {/* Informações do sistema (apenas na edição) */}
            {isEditing && initialData && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-mono text-xs">{initialData.id}</span>
                  </div>
                  
                  {initialData.created_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Criado em:</span>
                      <span className="text-xs">{new Date(initialData.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  
                  {initialData.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Atualizado em:</span>
                      <span className="text-xs">{new Date(initialData.updated_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}