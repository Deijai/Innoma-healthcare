// src/components/forms/FormComponents.tsx
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Input de busca reutilizável
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
        placeholder={placeholder || "Buscar..."}
      />
    </div>
  );
}

// Badge de status
export interface StatusBadgeProps {
  status: 'ATIVO' | 'INATIVO';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const baseClasses = "inline-flex items-center font-medium rounded-full";
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm"
  };
  
  const statusClasses = {
    ATIVO: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    INATIVO: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  return (
    <span className={cn(baseClasses, sizeClasses[size], statusClasses[status])}>
      {status}
    </span>
  );
}

// Input field com label e erro
export interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, error, required, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label className="text-sm font-medium mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

// Input de texto
export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  error?: boolean;
  className?: string;
}

export function TextInput({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  error, 
  className 
}: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md',
        error ? 'border-red-500' : 'border-input',
        className
      )}
    />
  );
}

// Select
export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
  className?: string;
}

export function Select({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  error, 
  className 
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md',
        error ? 'border-red-500' : 'border-input',
        className
      )}
    >
      {placeholder && (
        <option value="">{placeholder}</option>
      )}
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Textarea
export interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: boolean;
  className?: string;
}

export function Textarea({ 
  value, 
  onChange, 
  placeholder, 
  rows = 3, 
  error, 
  className 
}: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        'w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md resize-none',
        error ? 'border-red-500' : 'border-input',
        className
      )}
    />
  );
}

// Checkbox
export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <label className={cn('flex items-center space-x-2 cursor-pointer', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-border"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

// Switch/Toggle
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Switch({ checked, onChange, label, className }: SwitchProps) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      {label && <span className="text-sm font-medium">{label}</span>}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}