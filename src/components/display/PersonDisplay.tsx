// src/components/display/PersonDisplay.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '../forms/FormComponents';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2,
  Eye,
  Copy,
  Download,
  FileText,
  Clock
} from 'lucide-react';
import { Pessoa } from '@/lib/api-services';

// ==========================================
// INTERFACES
// ==========================================

export interface PersonDisplayProps {
  pessoa: Pessoa;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
  variant?: 'card' | 'inline' | 'detailed';
}

export interface PersonInfoItemProps {
  label: string;
  value: string | undefined;
  icon?: React.ReactNode;
  format?: 'cpf' | 'phone' | 'date' | 'email';
  copyable?: boolean;
}

// ==========================================
// UTILITÁRIOS DE FORMATAÇÃO
// ==========================================

const formatValue = (value: string | undefined, format?: string): string => {
  if (!value) return '-';
  
  switch (format) {
    case 'cpf':
      const cpfNumbers = value.replace(/\D/g, '');
      return cpfNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    case 'phone':
      const phoneNumbers = value.replace(/\D/g, '');
      if (phoneNumbers.length === 11) {
        return phoneNumbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
      return phoneNumbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    
    case 'date':
      return new Date(value).toLocaleDateString('pt-BR');
    
    case 'email':
      return value.toLowerCase();
    
    default:
      return value;
  }
};

const getSexoLabel = (sexo: string): string => {
  const labels: Record<string, string> = {
    'M': 'Masculino',
    'F': 'Feminino',
    'O': 'Outro',
  };
  return labels[sexo] || sexo;
};

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

// ==========================================
// COMPONENTE DE ITEM DE INFORMAÇÃO
// ==========================================

const PersonInfoItem: React.FC<PersonInfoItemProps> = ({
  label,
  value,
  icon,
  format,
  copyable = false,
}) => {
  const formattedValue = formatValue(value, format);
  
  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      // Aqui você pode adicionar uma notificação de sucesso
    }
  };

  if (!value) return null;

  return (
    <div className="flex items-center space-x-3 py-2">
      {icon && (
        <div className="text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-foreground">{formattedValue}</p>
          {copyable && (
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Copiar"
            >
              <Copy className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE DE ENDEREÇO
// ==========================================

const AddressDisplay: React.FC<{ endereco?: Pessoa['endereco'] }> = ({ endereco }) => {
  if (!endereco) return null;

  const hasAddress = Object.values(endereco).some(value => value);
  if (!hasAddress) return null;

  const formatAddress = () => {
    const parts = [];
    
    if (endereco.logradouro) {
      let street = endereco.logradouro;
      if (endereco.numero) street += `, ${endereco.numero}`;
      if (endereco.complemento) street += ` - ${endereco.complemento}`;
      parts.push(street);
    }
    
    if (endereco.bairro) parts.push(endereco.bairro);
    
    if (endereco.cidade || endereco.estado) {
      const cityState = [endereco.cidade, endereco.estado].filter(Boolean).join(' - ');
      parts.push(cityState);
    }
    
    if (endereco.cep) {
      const formattedCep = endereco.cep.replace(/(\d{5})(\d{3})/, '$1-$2');
      parts.push(`CEP: ${formattedCep}`);
    }
    
    return parts.join(', ');
  };

  return (
    <PersonInfoItem
      label="Endereço"
      value={formatAddress()}
      icon={<MapPin className="h-4 w-4" />}
      copyable
    />
  );
};

// ==========================================
// COMPONENTE PRINCIPAL - VERSÃO COMPACTA
// ==========================================

const PersonCompactDisplay: React.FC<PersonDisplayProps> = ({
  pessoa,
  onEdit,
  onDelete,
  onView,
  showActions = true,
}) => {
  const age = calculateAge(pessoa.data_nascimento);

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-foreground truncate">{pessoa.nome}</h3>
            <StatusBadge status={pessoa.status} size="sm" />
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
            <span>{formatValue(pessoa.cpf, 'cpf')}</span>
            <span>{age} anos</span>
            <span>{getSexoLabel(pessoa.sexo)}</span>
            {pessoa.telefone && <span>{formatValue(pessoa.telefone, 'phone')}</span>}
          </div>
        </div>
      </div>
      
      {showActions && (
        <div className="flex items-center space-x-1">
          {onView && (
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL - VERSÃO CARD
// ==========================================

const PersonCardDisplay: React.FC<PersonDisplayProps> = ({
  pessoa,
  onEdit,
  onDelete,
  onView,
  showActions = true,
}) => {
  const age = calculateAge(pessoa.data_nascimento);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{pessoa.nome}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <StatusBadge status={pessoa.status} />
                <span className="text-sm text-muted-foreground">
                  {getSexoLabel(pessoa.sexo)}, {age} anos
                </span>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-1">
              {onView && (
                <Button variant="ghost" size="sm" onClick={onView}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <PersonInfoItem
          label="CPF"
          value={pessoa.cpf}
          icon={<FileText className="h-4 w-4" />}
          format="cpf"
          copyable
        />
        
        <PersonInfoItem
          label="Data de Nascimento"
          value={pessoa.data_nascimento}
          icon={<Calendar className="h-4 w-4" />}
          format="date"
        />
        
        {pessoa.telefone && (
          <PersonInfoItem
            label="Telefone"
            value={pessoa.telefone}
            icon={<Phone className="h-4 w-4" />}
            format="phone"
            copyable
          />
        )}
        
        {pessoa.email && (
          <PersonInfoItem
            label="Email"
            value={pessoa.email}
            icon={<Mail className="h-4 w-4" />}
            format="email"
            copyable
          />
        )}
        
        <AddressDisplay endereco={pessoa.endereco} />
        
        {(pessoa.created_at || pessoa.updated_at) && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {pessoa.created_at && (
                <span>Criado em {formatValue(pessoa.created_at, 'date')}</span>
              )}
              {pessoa.updated_at && (
                <span>Atualizado em {formatValue(pessoa.updated_at, 'date')}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL - VERSÃO DETALHADA
// ==========================================

const PersonDetailedDisplay: React.FC<PersonDisplayProps> = ({
  pessoa,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const age = calculateAge(pessoa.data_nascimento);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{pessoa.nome}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <StatusBadge status={pessoa.status} />
              <span className="text-muted-foreground">
                {getSexoLabel(pessoa.sexo)}, {age} anos
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                ID: {pessoa.id}
              </span>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" onClick={onDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PersonInfoItem
              label="CPF"
              value={pessoa.cpf}
              icon={<FileText className="h-4 w-4" />}
              format="cpf"
              copyable
            />
            
            <PersonInfoItem
              label="Data de Nascimento"
              value={pessoa.data_nascimento}
              icon={<Calendar className="h-4 w-4" />}
              format="date"
            />
            
            <PersonInfoItem
              label="Idade"
              value={`${age} anos`}
              icon={<Clock className="h-4 w-4" />}
            />
            
            <PersonInfoItem
              label="Sexo"
              value={getSexoLabel(pessoa.sexo)}
              icon={<User className="h-4 w-4" />}
            />
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pessoa.telefone ? (
              <PersonInfoItem
                label="Telefone"
                value={pessoa.telefone}
                icon={<Phone className="h-4 w-4" />}
                format="phone"
                copyable
              />
            ) : (
              <p className="text-sm text-muted-foreground">Telefone não informado</p>
            )}
            
            {pessoa.email ? (
              <PersonInfoItem
                label="Email"
                value={pessoa.email}
                icon={<Mail className="h-4 w-4" />}
                format="email"
                copyable
              />
            ) : (
              <p className="text-sm text-muted-foreground">Email não informado</p>
            )}
            
            <AddressDisplay endereco={pessoa.endereco} />
            {!pessoa.endereco && (
              <p className="text-sm text-muted-foreground">Endereço não informado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pessoa.created_at && (
              <PersonInfoItem
                label="Data de Criação"
                value={pessoa.created_at}
                format="date"
              />
            )}
            
            {pessoa.updated_at && (
              <PersonInfoItem
                label="Última Atualização"
                value={pessoa.updated_at}
                format="date"
              />
            )}
            
            {pessoa.created_by && (
              <PersonInfoItem
                label="Criado por"
                value={pessoa.created_by}
              />
            )}
            
            {pessoa.updated_by && (
              <PersonInfoItem
                label="Atualizado por"
                value={pessoa.updated_by}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

// export const PersonDisplay: React.FC<PersonDisplayProps> = ({
//   variant = 'card',
//   className,
//   ...props
// }) => {
//   const Component = {
//     compact: PersonCompactDisplay,
//     card: PersonCardDisplay,
//     detailed: PersonDetailedDisplay,
//   }[variant];

//   return (
//     <div className={className}>
//       <Component {...props} />
//     </div>
//   );
// };