// src/components/forms/PersonForm.tsx
'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, FormSelect, FormSection } from './FormComponents';
import { Button } from '@/components/ui/Button';
import { User, Calendar, Phone, Mail, MapPin, Save, X } from 'lucide-react';
import { Pessoa, CriarPessoaRequest, AtualizarPessoaRequest, Endereco } from '@/lib/api-services';

// ==========================================
// VALIDAÇÃO COM ZOD
// ==========================================

const enderecoSchema = z.object({
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  coordenadas: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
});

const personSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome não pode exceder 255 caracteres'),
  data_nascimento: z.string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((date) => {
      const parsedDate = new Date(date);
      return parsedDate <= new Date();
    }, 'Data de nascimento não pode ser futura'),
  sexo: z.enum(['M', 'F', 'O'], {
    required_error: 'Sexo é obrigatório',
  }),
  cpf: z.string()
    .min(1, 'CPF é obrigatório')
    .refine((cpf) => {
      const numbers = cpf.replace(/\D/g, '');
      return numbers.length === 11;
    }, 'CPF deve ter 11 dígitos'),
  telefone: z.string().optional(),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email não pode exceder 255 caracteres')
    .optional()
    .or(z.literal('')),
  endereco: enderecoSchema.optional(),
});

type PersonFormData = z.infer<typeof personSchema>;

// ==========================================
// INTERFACES
// ==========================================

export interface PersonFormProps {
  initialData?: Pessoa;
  onSubmit: (data: CriarPessoaRequest | AtualizarPessoaRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
  className?: string;
  showEnderecoSection?: boolean;
  title?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
}

// ==========================================
// CONSTANTES
// ==========================================

const ESTADOS_BRASIL = [
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
  { value: 'TO', label: 'Tocantins' },
];

const SEXO_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
  { value: 'O', label: 'Outro' },
];

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const PersonForm: React.FC<PersonFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
  className,
  showEnderecoSection = true,
  title,
  submitButtonText,
  cancelButtonText = 'Cancelar',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    mode: 'onChange',
    defaultValues: initialData ? {
      nome: initialData.nome,
      data_nascimento: initialData.data_nascimento.split('T')[0], // Converter para formato yyyy-mm-dd
      sexo: initialData.sexo,
      cpf: initialData.cpf,
      telefone: initialData.telefone || '',
      email: initialData.email || '',
      endereco: initialData.endereco || undefined,
    } : {
      nome: '',
      data_nascimento: '',
      sexo: undefined as any,
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
        cep: '',
      },
    },
  });

  // Observar mudanças no CEP para buscar endereço
  const cep = watch('endereco.cep');

  useEffect(() => {
    if (cep && cep.length === 9) { // CEP com máscara: 12345-678
      buscarEnderecoPorCep(cep.replace(/\D/g, ''));
    }
  }, [cep]);

  const buscarEnderecoPorCep = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setValue('endereco.logradouro', data.logradouro || '');
        setValue('endereco.bairro', data.bairro || '');
        setValue('endereco.cidade', data.localidade || '');
        setValue('endereco.estado', data.uf || '');
      }
    } catch (error) {
      console.warn('Erro ao buscar CEP:', error);
    }
  };

  const onFormSubmit = async (data: PersonFormData) => {
    try {
      // Converter data para ISO string
      const formattedData = {
        ...data,
        data_nascimento: new Date(data.data_nascimento).toISOString(),
        email: data.email || undefined,
        telefone: data.telefone || undefined,
        endereco: data.endereco && Object.values(data.endereco).some(v => v) ? data.endereco : undefined,
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  const defaultSubmitText = isEditing ? 'Atualizar Pessoa' : 'Criar Pessoa';

  return (
    <div className={className}>
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Seção de Dados Pessoais */}
        <FormSection 
          title="Dados Pessoais" 
          description="Informações básicas da pessoa"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormInput
                label="Nome Completo"
                icon={<User className="h-4 w-4" />}
                required
                error={errors.nome?.message}
                {...register('nome')}
              />
            </div>
            
            <FormInput
              label="CPF"
              mask="cpf"
              required
              error={errors.cpf?.message}
              helpText="Somente números (será formatado automaticamente)"
              {...register('cpf')}
            />
            
            <FormInput
              label="Data de Nascimento"
              type="date"
              icon={<Calendar className="h-4 w-4" />}
              required
              error={errors.data_nascimento?.message}
              {...register('data_nascimento')}
            />
            
            <FormSelect
              label="Sexo"
              required
              options={SEXO_OPTIONS}
              placeholder="Selecione o sexo"
              error={errors.sexo?.message}
              {...register('sexo')}
            />
          </div>
        </FormSection>

        {/* Seção de Contato */}
        <FormSection 
          title="Informações de Contato" 
          description="Telefone e email para comunicação"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Telefone"
              icon={<Phone className="h-4 w-4" />}
              mask="phone"
              error={errors.telefone?.message}
              helpText="Formato: (11) 99999-9999"
              {...register('telefone')}
            />
            
            <FormInput
              label="Email"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
        </FormSection>

        {/* Seção de Endereço */}
        {showEnderecoSection && (
          <FormSection 
            title="Endereço" 
            description="Informações de localização"
            collapsible
            defaultCollapsed={!isEditing}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormInput
                label="CEP"
                icon={<MapPin className="h-4 w-4" />}
                mask="cep"
                error={errors.endereco?.cep?.message}
                helpText="Formato: 12345-678"
                {...register('endereco.cep')}
              />
              
              <div className="md:col-span-2">
                <FormInput
                  label="Logradouro"
                  error={errors.endereco?.logradouro?.message}
                  {...register('endereco.logradouro')}
                />
              </div>
              
              <FormInput
                label="Número"
                error={errors.endereco?.numero?.message}
                {...register('endereco.numero')}
              />
              
              <FormInput
                label="Complemento"
                error={errors.endereco?.complemento?.message}
                {...register('endereco.complemento')}
              />
              
              <FormInput
                label="Bairro"
                error={errors.endereco?.bairro?.message}
                {...register('endereco.bairro')}
              />
              
              <FormInput
                label="Cidade"
                error={errors.endereco?.cidade?.message}
                {...register('endereco.cidade')}
              />
              
              <FormSelect
                label="Estado"
                options={ESTADOS_BRASIL}
                placeholder="Selecione o estado"
                error={errors.endereco?.estado?.message}
                {...register('endereco.estado')}
              />
            </div>
          </FormSection>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              {cancelButtonText}
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {submitButtonText || defaultSubmitText}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};