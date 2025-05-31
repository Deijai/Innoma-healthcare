// src/components/forms/FormComponents.tsx
'use client';

import React, { forwardRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Eye, 
  EyeOff, 
  Search,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { useState } from 'react';

// ==========================================
// TIPOS COMPARTILHADOS
// ==========================================

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}

export interface InputProps extends FormFieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  icon?: React.ReactNode;
  mask?: 'cpf' | 'phone' | 'cep' | 'cnpj' | 'cartao-sus';
}

export interface SelectProps extends FormFieldProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export interface TextAreaProps extends FormFieldProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {}

// ==========================================
// COMPONENTE INPUT BASE
// ==========================================

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, disabled, className, helpText, icon, mask, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = props.type === 'password';

    const applyMask = (value: string, maskType: string) => {
      const numbers = value.replace(/\D/g, '');
      
      switch (maskType) {
        case 'cpf':
          return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        case 'phone':
          if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
          }
          return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        case 'cep':
          return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
        case 'cnpj':
          return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        case 'cartao-sus':
          return numbers.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
        default:
          return value;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask && e.target.value) {
        e.target.value = applyMask(e.target.value, mask);
      }
      props.onChange?.(e);
    };

    return (
      <div className={`space-y-2 ${className || ''}`}>
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            {...props}
            type={isPassword && showPassword ? 'text' : props.type}
            onChange={handleChange}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border border-input bg-background text-foreground text-sm
              rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${isPassword ? 'pr-10' : ''}
              ${error ? 'border-red-500 focus:ring-red-500' : ''}
            `}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        
        {error && (
          <div className="flex items-center space-x-1 text-red-500 text-xs">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
        
        {helpText && !error && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

// ==========================================
// COMPONENTE SELECT BASE
// ==========================================

export const FormSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, disabled, className, helpText, options, placeholder, ...props }, ref) => {
    return (
      <div className={`space-y-2 ${className || ''}`}>
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <select
          ref={ref}
          {...props}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-input bg-background text-foreground text-sm
            rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <div className="flex items-center space-x-1 text-red-500 text-xs">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
        
        {helpText && !error && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// ==========================================
// COMPONENTE TEXTAREA BASE
// ==========================================

export const FormTextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, required, disabled, className, helpText, ...props }, ref) => {
    return (
      <div className={`space-y-2 ${className || ''}`}>
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <textarea
          ref={ref}
          {...props}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-input bg-background text-foreground text-sm
            rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed resize-y
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
        />
        
        {error && (
          <div className="flex items-center space-x-1 text-red-500 text-xs">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
        
        {helpText && !error && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
      </div>
    );
  }
);

FormTextArea.displayName = 'FormTextArea';

// ==========================================
// COMPONENTE DE SEÇÃO DE FORMULÁRIO
// ==========================================

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Card className={className}>
      <CardHeader className={collapsible ? 'cursor-pointer' : ''} 
      onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <CardTitle className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {collapsible && (
            <Button variant="ghost" size="sm">
              {isCollapsed ? <Plus className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      {(!collapsible || !isCollapsed) && (
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

// ==========================================
// COMPONENTE DE LISTA DINÂMICA
// ==========================================

export interface DynamicListItem {
  id: string;
  [key: string]: any;
}

export interface DynamicListProps<T extends DynamicListItem> {
  items: T[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: Partial<T>) => void;
  renderItem: (item: T, onUpdate: (data: Partial<T>) => void, onRemove: () => void) => React.ReactNode;
  addButtonText?: string;
  emptyText?: string;
  title?: string;
  maxItems?: number;
}

export function DynamicList<T extends DynamicListItem>({
  items,
  onAdd,
  onRemove,
  onUpdate,
  renderItem,
  addButtonText = "Adicionar Item",
  emptyText = "Nenhum item adicionado",
  title,
  maxItems,
}: DynamicListProps<T>) {
  const canAddMore = !maxItems || items.length < maxItems;

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">{title}</h4>
          {canAddMore && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onAdd}
              className="h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              {addButtonText}
            </Button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <p className="text-sm">{emptyText}</p>
          {canAddMore && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={onAdd}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="p-4 border border-border rounded-lg bg-card relative"
            >
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              
              {renderItem(
                item,
                (data) => onUpdate(item.id, data),
                () => onRemove(item.id)
              )}
            </div>
          ))}
          
          {canAddMore && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onAdd}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE DE BUSCA
// ==========================================

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar...",
  loading = false,
  disabled = false,
  className,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      e.preventDefault();
      onSearch(value);
    }
  };

  return (
    <div className={`relative ${className || ''}`}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled || loading}
        className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      />
      
      {value && !loading && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// ==========================================
// COMPONENTE DE STATUS
// ==========================================

export interface StatusBadgeProps {
  status: 'ATIVO' | 'INATIVO' | 'PENDENTE' | 'BLOQUEADO' | 'SUSPENSO' | string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  size = 'sm',
}) => {
  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      'ATIVO': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
      'INATIVO': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200',
      'PENDENTE': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
      'BLOQUEADO': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
      'SUSPENSO': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200',
    };
    
    return styles[status] || styles['INATIVO'];
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const variantClasses = {
    default: getStatusStyle(status),
    outline: `border-2 bg-transparent ${getStatusStyle(status)}`,
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${sizeClasses[size]}
      ${variantClasses[variant]}
    `}>
      {status}
    </span>
  );
};

// ==========================================
// COMPONENTE DE LOADING
// ==========================================

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className || ''}`}>
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

// ==========================================
// COMPONENTE DE ALERTA/NOTIFICAÇÃO
// ==========================================

export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  className,
}) => {
  const getTypeStyle = (type: string) => {
    const styles: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
      success: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-200',
        icon: <CheckCircle className="h-4 w-4" />,
      },
      error: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200',
        icon: <AlertCircle className="h-4 w-4" />,
      },
      warning: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-800 dark:text-yellow-200',
        icon: <AlertCircle className="h-4 w-4" />,
      },
      info: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200',
        icon: <AlertCircle className="h-4 w-4" />,
      },
    };
    
    return styles[type] || styles.info;
  };

  const style = getTypeStyle(type);

  return (
    <div className={`
      p-4 border rounded-lg
      ${style.bg} ${style.border}
      ${className || ''}
    `}>
      <div className="flex items-start space-x-3">
        <div className={style.text}>
          {style.icon}
        </div>
        
        <div className="flex-1">
          {title && (
            <h4 className={`font-medium ${style.text}`}>
              {title}
            </h4>
          )}
          <p className={`text-sm ${style.text} ${title ? 'mt-1' : ''}`}>
            {message}
          </p>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className={`${style.text} hover:opacity-75`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE DE CONFIRMAÇÃO
// ==========================================

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'text-red-600 hover:bg-red-50',
    warning: 'text-yellow-600 hover:bg-yellow-50',
    info: 'text-blue-600 hover:bg-blue-50',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-background border border-border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${
            variant === 'danger' ? 'bg-red-100 text-red-600' :
            variant === 'warning' ? 'bg-yellow-100 text-yellow-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            <AlertCircle className="h-5 w-5" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={loading}
            className={variantStyles[variant]}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};