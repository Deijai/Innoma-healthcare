// src/components/forms/PersonForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  FormField, 
  Input, 
  Select, 
  DatePicker, 
  AddressFields, 
  RequiredFieldsIndicator,
  FormSection
} from './FormComponents';
import { CriarPessoaRequest, AtualizarPessoaRequest, Pessoa } from '@/lib/api-services';
import { formatCPF } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Save, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Search
} from 'lucide-react';

// ===================================
// INTERFACES
// ===================================

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
  data_nascimento: string;
  sexo: 'M' | 'F' | 'O';
  cpf: string;
  telefone: string;
  email: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  status?: 'ATIVO' | 'INATIVO';
}

interface FormErrors {
  [key: string]: string;
}

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

export const PersonForm: React.FC<PersonFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
  title,
  submitButtonText,
  showEnderecoSection = true,
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>({
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
    },
    status: 'ATIVO'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // Preencher formulário com dados iniciais
  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || '',
        data_nascimento: initialData.data_nascimento ? initialData.data_nascimento.split('T')[0] : '',
        sexo: initialData.sexo || 'M',
        cpf: initialData.cpf || '',
        telefone: initialData.telefone || '',
        email: initialData.email || '',
        endereco: {
          logradouro: initialData.endereco?.logradouro || '',
          numero: initialData.endereco?.numero || '',
          complemento: initialData.endereco?.complemento || '',
          bairro: initialData.endereco?.bairro || '',
          cidade: initialData.endereco?.cidade || '',
          estado: initialData.endereco?.estado || '',
          cep: initialData.endereco?.cep || ''
        },
        status: initialData.status || 'ATIVO'
      });
    }
  }, [initialData]);

  // ===================================
  // VALIDAÇÕES
  // ===================================

  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(numbers)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[10])) return false;

    return true;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    // Data de nascimento
    if (!formData.data_nascimento) {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    } else {
      const birthDate = new Date(formData.data_nascimento);
      const today = new Date();
      if (birthDate > today) {
        newErrors.data_nascimento = 'Data de nascimento não pode ser futura';
      }
      
      // Verificar idade mínima (não pode ser maior que 150 anos)
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age > 150) {
        newErrors.data_nascimento = 'Data de nascimento inválida';
      }
    }

    // Email (opcional, mas se informado deve ser válido)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Telefone (opcional, mas se informado deve ter formato válido)
    if (formData.telefone) {
      const phoneNumbers = formData.telefone.replace(/\D/g, '');
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.telefone = 'Telefone deve ter 10 ou 11 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===================================
  // HANDLERS
  // ===================================

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setIsDirty(true);
    
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
    
    setIsDirty(true);
    
    // Limpar erro do campo
    const errorKey = `endereco.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Preparar dados para envio
      const submitData: CriarPessoaRequest | AtualizarPessoaRequest = {
        nome: formData.nome.trim(),
        data_nascimento: formData.data_nascimento,
        sexo: formData.sexo,
        cpf: formData.cpf.replace(/\D/g, ''), // Enviar apenas números
        telefone: formData.telefone || undefined,
        email: formData.email || undefined,
        endereco: showEnderecoSection && Object.values(formData.endereco).some(v => v) 
          ? formData.endereco 
          : undefined
      };

      // Para edição, incluir status se mudou
      if (isEditing && initialData && formData.status !== initialData.status) {
        (submitData as AtualizarPessoaRequest).status = formData.status;
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (confirm('Você tem alterações não salvas. Deseja realmente cancelar?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  // ===================================
  // FORMATAÇÃO
  // ===================================

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const handleCPFChange = (value: string) => {
    const formattedCPF = formatCPF(value);
    handleInputChange('cpf', formattedCPF);
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhoneNumber(value);
    handleInputChange('telefone', formattedPhone);
  };

  // ===================================
  // OPÇÕES DE SELECT
  // ===================================

  const sexoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
    { value: 'O', label: 'Outro' }
  ];

  const statusOptions = [
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'INATIVO', label: 'Inativo' }
  ];

  // ===================================
  // RENDER
  // ===================================

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        {/* Header */}
        {title && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{title}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        {/* Dados pessoais básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informações Pessoais</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Dados básicos da pessoa</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <RequiredFieldsIndicator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Nome completo"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  error={errors.nome}
                  required
                  placeholder="Nome completo da pessoa"
                  leftIcon={<User className="h-4 w-4" />}
                />
              </div>

              <Input
                label="CPF"
                value={formData.cpf}
                onChange={(e) => handleCPFChange(e.target.value)}
                error={errors.cpf}
                required
                placeholder="000.000.000-00"
                maxLength={14}
                leftIcon={<FileText className="h-4 w-4" />}
                disabled={isEditing} // CPF não pode ser alterado
              />

              <DatePicker
                label="Data de nascimento"
                value={formData.data_nascimento}
                onChange={(value) => handleInputChange('data_nascimento', value)}
                error={errors.data_nascimento}
                required
                max={new Date().toISOString().split('T')[0]} // Não pode ser futura
              />

              <Select
                label="Sexo"
                value={formData.sexo}
                onChange={(e) => handleInputChange('sexo', e.target.value)}
                error={errors.sexo}
                options={sexoOptions}
                required
              />

              {isEditing && (
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  options={statusOptions}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações de contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Informações de Contato</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Email e telefone (opcionais)</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                placeholder="email@exemplo.com"
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <Input
                label="Telefone"
                value={formData.telefone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                error={errors.telefone}
                placeholder="(11) 99999-9999"
                leftIcon={<Phone className="h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        {showEnderecoSection && (
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressFields
                endereco={formData.endereco}
                onChange={handleEnderecoChange}
                errors={errors}
              />
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDirty && (
                  <div className="flex items-center space-x-2 text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Alterações não salvas</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading || (!isDirty && isEditing)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditing ? 'Salvando...' : 'Criando...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {submitButtonText || (isEditing ? 'Salvar Alterações' : 'Cadastrar Pessoa')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações adicionais para desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Info (apenas em desenvolvimento)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div><strong>isDirty:</strong> {isDirty.toString()}</div>
                <div><strong>isEditing:</strong> {isEditing.toString()}</div>
                <div><strong>Errors:</strong> {Object.keys(errors).length}</div>
                {Object.keys(errors).length > 0 && (
                  <pre className="bg-red-50 p-2 rounded text-red-800 text-xs overflow-auto">
                    {JSON.stringify(errors, null, 2)}
                  </pre>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  );
};

// ===================================
// COMPONENTE DE PREVIEW DA PESSOA
// ===================================

export const PersonPreview: React.FC<{
  pessoa: Pessoa;
  onEdit?: () => void;
  onCreateUser?: () => void;
  onCreatePatient?: () => void;
  onCreateDoctor?: () => void;
  className?: string;
}> = ({ 
  pessoa, 
  onEdit, 
  onCreateUser, 
  onCreatePatient, 
  onCreateDoctor,
  className 
}) => {
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getSexoDisplay = (sexo: string) => {
    const map = { 'M': 'Masculino', 'F': 'Feminino', 'O': 'Outro' };
    return map[sexo as keyof typeof map] || sexo;
  };

  const age = calculateAge(pessoa.data_nascimento);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{pessoa.nome}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {pessoa.status === 'ATIVO' ? (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativo
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                <X className="h-3 w-3 mr-1" />
                Inativo
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações básicas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">CPF:</span>
            <p className="font-medium">{formatCPF(pessoa.cpf)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Idade:</span>
            <p className="font-medium">{age} anos</p>
          </div>
          <div>
            <span className="text-muted-foreground">Sexo:</span>
            <p className="font-medium">{getSexoDisplay(pessoa.sexo)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Data de nascimento:</span>
            <p className="font-medium">
              {new Date(pessoa.data_nascimento).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Contato */}
        {(pessoa.email || pessoa.telefone) && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Contato</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {pessoa.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span>{pessoa.email}</span>
                </div>
              )}
              {pessoa.telefone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{pessoa.telefone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Endereço */}
        {pessoa.endereco && Object.values(pessoa.endereco).some(v => v) && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Endereço</h4>
            <div className="text-sm text-muted-foreground">
              {pessoa.endereco.logradouro && (
                <p>
                  {pessoa.endereco.logradouro}
                  {pessoa.endereco.numero && `, ${pessoa.endereco.numero}`}
                  {pessoa.endereco.complemento && ` - ${pessoa.endereco.complemento}`}
                </p>
              )}
              {pessoa.endereco.bairro && <p>{pessoa.endereco.bairro}</p>}
              {(pessoa.endereco.cidade || pessoa.endereco.estado) && (
                <p>
                  {pessoa.endereco.cidade}
                  {pessoa.endereco.estado && ` - ${pessoa.endereco.estado}`}
                </p>
              )}
              {pessoa.endereco.cep && <p>CEP: {pessoa.endereco.cep}</p>}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <User className="h-4 w-4 mr-2" />
              Editar Pessoa
            </Button>
          )}
          {onCreateUser && (
            <Button variant="outline" size="sm" onClick={onCreateUser}>
              <User className="h-4 w-4 mr-2" />
              Criar Usuário
            </Button>
          )}
          {onCreatePatient && (
            <Button variant="outline" size="sm" onClick={onCreatePatient}>
              <User className="h-4 w-4 mr-2" />
              Criar Paciente
            </Button>
          )}
          {onCreateDoctor && (
            <Button variant="outline" size="sm" onClick={onCreateDoctor}>
              <User className="h-4 w-4 mr-2" />
              Criar Médico
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ===================================
// COMPONENTE DE BUSCA DE PESSOA
// ===================================

export const PersonSelector: React.FC<{
  onPersonSelect: (person: Pessoa) => void;
  selectedPerson?: Pessoa;
  onClearSelection?: () => void;
  placeholder?: string;
  className?: string;
}> = ({ 
  onPersonSelect, 
  selectedPerson, 
  onClearSelection, 
  placeholder = "Buscar pessoa por nome ou CPF...",
  className 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Implementar busca real aqui
  const searchPeople = async (term: string) => {
    if (term.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      // TODO: Implementar busca real
      // const response = await pessoaService.listar({ search: term, limit: 10 });
      // setResults(response.data);
      
      // Mock por enquanto
      setResults([]);
      setShowResults(true);
    } catch (error) {
      console.error('Erro ao buscar pessoas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchPeople(value);
  };

  const selectPerson = (person: Pessoa) => {
    onPersonSelect(person);
    setSearchTerm('');
    setShowResults(false);
  };

  const clearSelection = () => {
    if (onClearSelection) {
      onClearSelection();
    }
    setSearchTerm('');
    setShowResults(false);
  };

  if (selectedPerson) {
    return (
      <div className={className}>
        <PersonPreview 
          pessoa={selectedPerson}
          onEdit={() => clearSelection()}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
            placeholder={placeholder}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>

        {showResults && results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
            {results.map((person) => (
              <button
                key={person.id}
                onClick={() => selectPerson(person)}
                className="w-full p-3 text-left hover:bg-accent border-b border-border last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{person.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      CPF: {formatCPF(person.cpf)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {person.email && <p>{person.email}</p>}
                    {person.telefone && <p>{person.telefone}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showResults && results.length === 0 && !loading && searchTerm.length >= 3 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma pessoa encontrada</p>
          <p>Tente buscar por nome ou CPF</p>
        </div>
      )}
    </div>
  );
};