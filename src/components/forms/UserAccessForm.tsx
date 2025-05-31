// src/components/forms/UserAccessForm.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { UserFormData, FormErrors } from '@/app/dashboard/users/new/page';

interface UserAccessFormProps {
  formData: UserFormData;
  errors: FormErrors;
  onInputChange: (field: string, value: any) => void;
  currentUser?: any;
}

export function UserAccessForm({ formData, errors, onInputChange, currentUser }: UserAccessFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Dados de Acesso</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Nome de usuário *
            </label>
            <input
              type="text"
              value={formData.usuario}
              onChange={(e) => onInputChange('usuario', e.target.value.toLowerCase())}
              className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                errors.usuario ? 'border-red-500' : 'border-input'
              }`}
              placeholder="usuario.exemplo"
            />
            {errors.usuario && (
              <p className="text-red-600 text-xs mt-1">{errors.usuario}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Papel *
            </label>
            <select
              value={formData.papel}
              onChange={(e) => onInputChange('papel', e.target.value)}
              className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                errors.papel ? 'border-red-500' : 'border-input'
              }`}
            >
              <option value="RECEPCIONISTA">Recepcionista</option>
              <option value="ENFERMEIRO">Enfermeiro</option>
              <option value="MEDICO">Médico</option>
              <option value="FARMACEUTICO">Farmacêutico</option>
              <option value="LABORATORISTA">Laboratorista</option>
              <option value="GESTOR">Gestor</option>
              {currentUser?.papel === 'ADMIN' && (
                <option value="ADMIN">Administrador</option>
              )}
            </select>
            {errors.papel && (
              <p className="text-red-600 text-xs mt-1">{errors.papel}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Senha *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={(e) => onInputChange('senha', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                  errors.senha ? 'border-red-500' : 'border-input'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.senha && (
              <p className="text-red-600 text-xs mt-1">{errors.senha}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Confirmar senha *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmar_senha}
                onChange={(e) => onInputChange('confirmar_senha', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                  errors.confirmar_senha ? 'border-red-500' : 'border-input'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmar_senha && (
              <p className="text-red-600 text-xs mt-1">{errors.confirmar_senha}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}