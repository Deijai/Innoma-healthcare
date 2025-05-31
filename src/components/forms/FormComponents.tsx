// src/components/forms/FormComponents.tsx
'use client';

import React, { forwardRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Search, Eye, EyeOff, Calendar, MapPin, User, Mail, Phone, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';

// ===================================
// INTERFACES
// ===================================

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

interface StatusBadgeProps {
  status: 'ATIVO' | 'INATIVO' | 'PENDENTE' | 'BLOQUEADO';
  size?: 'sm' | 'md' | 'lg';
}

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  min?: string;
  max?: string;
  required?: boolean;
}

interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showStrength?: boolean;
}

interface AddressFieldsProps {
  endereco: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

// ===================================
// COMPONENTES BÁSICOS
// ===================================

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  error, 
  required, 
  children, 
  className 
}) => (
  <div className={`space-y-2 ${className || ''}`}>
    <label className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-red-600 text-xs flex items-center space-x-1">
        <AlertCircle className="h-3 w-3" />
        <span>{error}</span>
      </p>
    )}
  </div>
);

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, ...props }, ref) => (
    <FormField label={label} error={error} required={props.required}>
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 border border-input bg-background text-sm 
            focus:outline-none focus:ring-2 focus:ring-ring rounded-md
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500' : ''}
            ${className || ''}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
    </FormField>
  )
);

Input.displayName = 'Input';

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, ...props }, ref) => (
    <FormField label={label} error={error} required={props.required}>
      <textarea
        ref={ref}
        className={`
          w-full px-3 py-2 border border-input bg-background text-sm 
          focus:outline-none focus:ring-2 focus:ring-ring rounded-md
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : ''}
          ${className || ''}
        `}
        {...props}
      />
    </FormField>
  )
);

TextArea.displayName = 'TextArea';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => (
    <FormField label={label} error={error} required={props.required}>
      <select
        ref={ref}
        className={`
          w-full px-3 py-2 border border-input bg-background text-sm 
          focus:outline-none focus:ring-2 focus:ring-ring rounded-md
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : ''}
          ${className || ''}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  )
);

Select.displayName = 'Select';

// ===================================
// COMPONENTES ESPECIALIZADOS
// ===================================

export const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Buscar...", 
  className,
  onClear 
}) => {
  return (
    <div className={`relative ${className || ''}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
        placeholder={placeholder}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const statusConfig = {
    ATIVO: {
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    INATIVO: {
      icon: X,
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    },
    PENDENTE: {
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    },
    BLOQUEADO: {
      icon: AlertCircle,
      className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${config.className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {status}
    </span>
  );
};

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  min,
  max,
  required
}) => (
  <FormField label={label} error={error} required={required}>
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        className={`
          w-full pl-10 pr-3 py-2 border border-input bg-background text-sm 
          focus:outline-none focus:ring-2 focus:ring-ring rounded-md
          ${error ? 'border-red-500' : ''}
        `}
      />
    </div>
  </FormField>
);

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  showStrength,
  value,
  onChange,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengthMap = {
      0: { label: 'Muito fraca', color: 'bg-red-500' },
      1: { label: 'Fraca', color: 'bg-red-400' },
      2: { label: 'Regular', color: 'bg-yellow-500' },
      3: { label: 'Boa', color: 'bg-yellow-400' },
      4: { label: 'Forte', color: 'bg-green-500' },
      5: { label: 'Muito forte', color: 'bg-green-600' }
    };

    return { score, ...strengthMap[score as keyof typeof strengthMap] };
  };

  const strength = showStrength && value ? getPasswordStrength(value as string) : null;

  return (
    <FormField label={label} error={error} required={props.required}>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={`
            w-full px-3 py-2 pr-10 border border-input bg-background text-sm 
            focus:outline-none focus:ring-2 focus:ring-ring rounded-md
            ${error ? 'border-red-500' : ''}
          `}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      
      {strength && (
        <div className="mt-2">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${(strength.score / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{strength.label}</span>
          </div>
        </div>
      )}
    </FormField>
  );
};

export const AddressFields: React.FC<AddressFieldsProps> = ({
  endereco,
  onChange,
  errors = {},
  disabled = false
}) => {
  const estadosBrasil = [
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

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center space-x-2">
        <MapPin className="h-4 w-4" />
        <span>Endereço</span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Logradouro"
            value={endereco.logradouro || ''}
            onChange={(e) => onChange('logradouro', e.target.value)}
            error={errors.logradouro}
            placeholder="Rua, Avenida, etc."
            disabled={disabled}
          />
        </div>

        <div>
          <Input
            label="Número"
            value={endereco.numero || ''}
            onChange={(e) => onChange('numero', e.target.value)}
            error={errors.numero}
            placeholder="123"
            disabled={disabled}
          />
        </div>

        <div>
          <Input
            label="Complemento"
            value={endereco.complemento || ''}
            onChange={(e) => onChange('complemento', e.target.value)}
            error={errors.complemento}
            placeholder="Apto, Bloco, etc."
            disabled={disabled}
          />
        </div>

        <div>
          <Input
            label="Bairro"
            value={endereco.bairro || ''}
            onChange={(e) => onChange('bairro', e.target.value)}
            error={errors.bairro}
            placeholder="Centro"
            disabled={disabled}
          />
        </div>

        <div>
          <Input
            label="Cidade"
            value={endereco.cidade || ''}
            onChange={(e) => onChange('cidade', e.target.value)}
            error={errors.cidade}
            placeholder="São Paulo"
            disabled={disabled}
          />
        </div>

        <div>
          <Select
            label="Estado"
            value={endereco.estado || ''}
            onChange={(e) => onChange('estado', e.target.value)}
            error={errors.estado}
            options={estadosBrasil}
            placeholder="Selecione o estado"
            disabled={disabled}
          />
        </div>

        <div>
          <Input
            label="CEP"
            value={endereco.cep ? formatCEP(endereco.cep) : ''}
            onChange={(e) => onChange('cep', e.target.value.replace(/\D/g, ''))}
            error={errors.cep}
            placeholder="00000-000"
            maxLength={9}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

// ===================================
// COMPONENTES DE VALIDAÇÃO
// ===================================

export const RequiredFieldsIndicator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`text-xs text-muted-foreground ${className || ''}`}>
    <span className="text-red-500">*</span> Campos obrigatórios
  </div>
);

export const FormSection: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, icon, children, className }) => (
  <div className={`space-y-4 ${className || ''}`}>
    <div className="flex items-center space-x-2">
      {icon}
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    {children}
  </div>
);

// ===================================
// COMPONENTES DE BUSCA AVANÇADA
// ===================================

export const PersonSearchField: React.FC<{
  onPersonSelect: (person: any) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ onPersonSelect, placeholder = "Buscar pessoa por nome ou CPF", disabled }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Simular busca de pessoas (substituir pela implementação real)
  const searchPeople = async (term: string) => {
    if (term.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      // Aqui você faria a chamada real para a API
      // const response = await pessoaService.listar({ search: term, limit: 10 });
      // setResults(response.data);
      
      // Mock de resultados por enquanto
      setResults([
        { id: '1', nome: 'João Silva', cpf: '123.456.789-00', email: 'joao@email.com' },
        { id: '2', nome: 'Maria Santos', cpf: '987.654.321-00', email: 'maria@email.com' }
      ]);
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

  const selectPerson = (person: any) => {
    onPersonSelect(person);
    setSearchTerm(person.nome);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <SearchInput
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder={placeholder}
        onClear={() => {
          setSearchTerm('');
          setResults([]);
          setShowResults(false);
        }}
      />
      
      {loading && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((person) => (
            <button
              key={person.id}
              onClick={() => selectPerson(person)}
              className="w-full p-3 text-left hover:bg-accent border-b border-border last:border-0 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-sm">{person.nome}</p>
                <p className="text-xs text-muted-foreground">CPF: {person.cpf}</p>
              </div>
              {person.email && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{person.email}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ===================================
// EXPORTAÇÕES
// ===================================

export type {
  FormFieldProps,
  InputProps,
  TextAreaProps,
  SelectProps,
  SearchInputProps,
  StatusBadgeProps,
  DatePickerProps,
  PasswordInputProps,
  AddressFieldsProps
};