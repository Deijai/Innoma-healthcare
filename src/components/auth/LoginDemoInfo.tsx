// src/components/auth/LoginDemoInfo.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Info, 
  User, 
  Key, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  Copy,
  CheckCircle
} from 'lucide-react';
import { demoUsers } from '@/lib/demo-tenants';

interface LoginDemoInfoProps {
  selectedTenant?: string;
  onCredentialSelect?: (usuario: string, senha: string) => void;
}

export function LoginDemoInfo({ selectedTenant, onCredentialSelect }: LoginDemoInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleCredentialClick = (usuario: string, senha: string) => {
    if (onCredentialSelect) {
      onCredentialSelect(usuario, senha);
    }
  };

  const users = selectedTenant ? (demoUsers[selectedTenant as keyof typeof demoUsers] || demoUsers.demo) : demoUsers.demo;

  const getRoleColor = (papel: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'MEDICO': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'ENFERMEIRO': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'RECEPCIONISTA': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'FARMACEUTICO': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'LABORATORISTA': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'GESTOR': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    };
    return colors[papel] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getRoleDescription = (papel: string) => {
    const descriptions: Record<string, string> = {
      'ADMIN': 'Acesso completo ao sistema',
      'MEDICO': 'Consultas, prescrições e exames',
      'ENFERMEIRO': 'Triagem, medicações e procedimentos',
      'RECEPCIONISTA': 'Agendamentos e cadastros',
      'FARMACEUTICO': 'Medicamentos e estoque',
      'LABORATORISTA': 'Exames e resultados',
      'GESTOR': 'Relatórios e gestão',
    };
    return descriptions[papel] || 'Acesso básico';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader 
        className="cursor-pointer"
        //onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span>Credenciais de Teste</span>
          </div>
          {isExpanded ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="text-xs text-muted-foreground mb-4">
            <p className="mb-2">
              <strong>Ambiente de demonstração:</strong> Use as credenciais abaixo para testar o sistema.
            </p>
            <p>
              Clique em uma credencial para preenchimento automático.
            </p>
          </div>

          <div className="space-y-3">
            {users.map((user, index) => (
              <div 
                key={index}
                className="border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleCredentialClick(user.usuario, user.senha)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{user.nome}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.papel)}`}>
                    {user.papel}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3">
                  {getRoleDescription(user.papel)}
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span className="font-mono">{user.usuario}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(user.usuario, `usuario-${index}`);
                      }}
                    >
                      {copiedField === `usuario-${index}` ? 
                        <CheckCircle className="h-3 w-3 text-green-500" /> :
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center space-x-1">
                      <Key className="h-3 w-3" />
                      <span className="font-mono">{user.senha}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(user.senha, `senha-${index}`);
                      }}
                    >
                      {copiedField === `senha-${index}` ? 
                        <CheckCircle className="h-3 w-3 text-green-500" /> :
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex items-start space-x-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                  Aviso de Segurança
                </p>
                <p>
                  Estas são credenciais de demonstração. Em produção, use senhas seguras e únicas.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}