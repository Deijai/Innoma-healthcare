// ===================================================================
// COMPONENTE DE VALIDAÇÃO DE CPF EM TEMPO REAL
// src/components/forms/CPFInput.tsx
// ===================================================================

import React, { useState, useEffect } from 'react';
import { FormInput } from './FormComponents';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { formatCPF } from '@/lib/utils';
import { usePersonValidation } from '@/hooks/usePersonValidation';

interface CPFInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  excludeId?: string; // Para edição, excluir o próprio ID da validação
  required?: boolean;
  disabled?: boolean;
  onValidationChange?: (isValid: boolean, existingPerson?: any) => void;
}

export const CPFInput: React.FC<CPFInputProps> = ({
  label = 'CPF',
  value,
  onChange,
  error,
  excludeId,
  required = false,
  disabled = false,
  onValidationChange
}) => {
  const { validateCPF, loading } = usePersonValidation();
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid' | 'duplicate'>('idle');
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [existingPerson, setExistingPerson] = useState<any>(null);

  // Debounce validation
  useEffect(() => {
    if (!value || value.replace(/\D/g, '').length < 11) {
      setValidationState('idle');
      setValidationMessage('');
      setExistingPerson(null);
      onValidationChange?.(false);
      return;
    }

    const timer = setTimeout(async () => {
      const result = await validateCPF(value, excludeId);
      
      if (result.isValid) {
        setValidationState('valid');
        setValidationMessage('CPF válido');
        setExistingPerson(null);
        onValidationChange?.(true);
      } else {
        if (result.person) {
          setValidationState('duplicate');
          setExistingPerson(result.person);
          onValidationChange?.(false, result.person);
        } else {
          setValidationState('invalid');
          setExistingPerson(null);
          onValidationChange?.(false);
        }
        setValidationMessage(result.error || 'CPF inválido');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, excludeId, validateCPF, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCPF(e.target.value);
    onChange(formattedValue);
  };

  const getValidationIcon = () => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    
    switch (validationState) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'duplicate':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getValidationColor = () => {
    switch (validationState) {
      case 'valid':
        return 'text-green-600 dark:text-green-400';
      case 'invalid':
        return 'text-red-600 dark:text-red-400';
      case 'duplicate':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <FormInput
          label={label}
          value={value}
          onChange={handleChange}
          error={error}
          required={required}
          disabled={disabled}
          placeholder="000.000.000-00"
          maxLength={14}
        />
        
        {/* Ícone de validação */}
        {value && (
          <div className="absolute right-3 top-8">
            {getValidationIcon()}
          </div>
        )}
      </div>

      {/* Mensagem de validação */}
      {value && validationMessage && (
        <div className={`flex items-center space-x-2 text-xs ${getValidationColor()}`}>
          {getValidationIcon()}
          <span>{validationMessage}</span>
        </div>
      )}

      {/* Pessoa existente encontrada */}
      {existingPerson && validationState === 'duplicate' && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                CPF já cadastrado
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                <strong>Nome:</strong> {existingPerson.nome}<br />
                <strong>ID:</strong> {existingPerson.id}
              </p>
              <div className="mt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => window.open(`/dashboard/people/${existingPerson.id}`, '_blank')}
                  className="text-xs text-yellow-700 dark:text-yellow-300 underline hover:no-underline"
                >
                  Ver pessoa
                </button>
                <button
                  type="button"
                  onClick={() => window.open(`/dashboard/users/new?pessoa_id=${existingPerson.id}`, '_blank')}
                  className="text-xs text-yellow-700 dark:text-yellow-300 underline hover:no-underline"
                >
                  Criar usuário para esta pessoa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};