// ===================================================================
// HOOK PERSONALIZADO PARA VALIDAÇÃO DE CPF
// src/lib/hooks/usePersonValidation.ts
// ===================================================================

import { useState } from 'react';
import { pessoaService } from '@/lib/api-services';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  person?: any;
}

export function usePersonValidation() {
  const [loading, setLoading] = useState(false);

  const validateCPF = async (cpf: string, excludeId?: string): Promise<ValidationResult> => {
    if (!cpf) {
      return { isValid: false, error: 'CPF é obrigatório' };
    }

    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) {
      return { isValid: false, error: 'CPF deve ter 11 dígitos' };
    }

    // Validação básica de CPF
    if (!isValidCPFFormat(cleanCPF)) {
      return { isValid: false, error: 'CPF inválido' };
    }

    try {
      setLoading(true);
      
      // Verificar se CPF já existe no sistema
      const existingPerson = await pessoaService.buscarPorCpf(cleanCPF);
      
      if (existingPerson && existingPerson.id !== excludeId) {
        return { 
          isValid: false, 
          error: `CPF já cadastrado para: ${existingPerson.nome}`,
          person: existingPerson
        };
      }

      return { isValid: true };
    } catch (error) {
      // Se retornou 404, significa que o CPF não existe (que é bom)
      if (error instanceof Error && error.message.includes('404')) {
        return { isValid: true };
      }
      
      // Outros erros
      console.error('Erro ao validar CPF:', error);
      return { isValid: false, error: 'Erro ao validar CPF' };
    } finally {
      setLoading(false);
    }
  };

  const isValidCPFFormat = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '');
    
    if (numbers.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    let digit1 = remainder < 2 ? 0 : remainder;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    let digit2 = remainder < 2 ? 0 : remainder;
    
    return digit1 === parseInt(numbers.charAt(9)) && 
           digit2 === parseInt(numbers.charAt(10));
  };

  return {
    validateCPF,
    isValidCPFFormat,
    loading
  };
}