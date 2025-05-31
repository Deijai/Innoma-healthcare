// src/components/forms/UserPermissions.tsx
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, X } from 'lucide-react';
import { UserFormData } from '@/app/dashboard/users/new/page';

interface UserPermissionsProps {
  formData: UserFormData;
  onPermissionChange: (permission: string, checked: boolean) => void;
}

const availablePermissions = [
  'CADASTRAR_PACIENTE', 'EDITAR_PACIENTE', 'VISUALIZAR_PACIENTE', 'DELETAR_PACIENTE',
  'CADASTRAR_MEDICO', 'EDITAR_MEDICO', 'VISUALIZAR_MEDICO', 'DELETAR_MEDICO',
  'AGENDAR_CONSULTA', 'CANCELAR_CONSULTA', 'REALIZAR_ATENDIMENTO', 'VISUALIZAR_AGENDA',
  'PRESCREVER_MEDICAMENTO', 'SOLICITAR_EXAME', 'GERAR_RELATORIOS',
  'GERENCIAR_USUARIOS', 'CONFIGURAR_SISTEMA', 'GERENCIAR_UNIDADES',
  'VISUALIZAR_FINANCEIRO', 'GERENCIAR_ESTOQUE'
];

export function UserPermissions({ formData, onPermissionChange }: UserPermissionsProps) {
  // Autocompletar permissões baseado no papel
  const setDefaultPermissions = (papel: string) => {
    const permissoesPorPapel: Record<string, string[]> = {
      'ADMIN': availablePermissions,
      'MEDICO': [
        'VISUALIZAR_PACIENTE', 'EDITAR_PACIENTE',
        'AGENDAR_CONSULTA', 'CANCELAR_CONSULTA', 'REALIZAR_ATENDIMENTO', 'VISUALIZAR_AGENDA',
        'PRESCREVER_MEDICAMENTO', 'SOLICITAR_EXAME'
      ],
      'ENFERMEIRO': [
        'VISUALIZAR_PACIENTE', 'EDITAR_PACIENTE',
        'AGENDAR_CONSULTA', 'VISUALIZAR_AGENDA'
      ],
      'RECEPCIONISTA': [
        'CADASTRAR_PACIENTE', 'EDITAR_PACIENTE', 'VISUALIZAR_PACIENTE',
        'AGENDAR_CONSULTA', 'CANCELAR_CONSULTA', 'VISUALIZAR_AGENDA'
      ],
      'FARMACEUTICO': [
        'VISUALIZAR_PACIENTE', 'GERENCIAR_ESTOQUE'
      ],
      'LABORATORISTA': [
        'VISUALIZAR_PACIENTE', 'GERENCIAR_ESTOQUE'
      ],
      'GESTOR': [
        'VISUALIZAR_PACIENTE', 'VISUALIZAR_MEDICO', 'VISUALIZAR_AGENDA',
        'GERAR_RELATORIOS', 'VISUALIZAR_FINANCEIRO'
      ]
    };

    const novasPermissoes = permissoesPorPapel[papel] || [];
    
    // Limpar permissões atuais e adicionar as novas
    availablePermissions.forEach(permission => {
      onPermissionChange(permission, novasPermissoes.includes(permission));
    });
  };

  // Aplicar permissões padrão quando o papel mudar
  useEffect(() => {
    if (formData.papel) {
      setDefaultPermissions(formData.papel);
    }
  }, [formData.papel]);

  const formatPermissionName = (permission: string) => {
    return permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Permissões do Sistema</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDefaultPermissions(formData.papel)}
          >
            Aplicar Padrão
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            As permissões são preenchidas automaticamente baseadas no papel selecionado, mas você pode personalizar.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availablePermissions.map((permission) => (
              <label 
                key={permission} 
                className="flex items-center space-x-3 p-3 border border-input rounded-md hover:bg-accent cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.permissoes.includes(permission)}
                  onChange={(e) => onPermissionChange(permission, e.target.checked)}
                  className="rounded border-border"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    {formatPermissionName(permission)}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {formData.permissoes.length > 0 && (
            <div className="mt-4 p-3 bg-accent rounded-md">
              <p className="text-sm font-medium mb-2">
                Permissões selecionadas ({formData.permissoes.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.permissoes.map((permission) => (
                  <span 
                    key={permission} 
                    className="inline-flex items-center px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full"
                  >
                    {formatPermissionName(permission)}
                    <button
                      type="button"
                      onClick={() => onPermissionChange(permission, false)}
                      className="ml-2 hover:bg-primary-foreground hover:text-primary rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}