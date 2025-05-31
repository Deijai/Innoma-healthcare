// src/components/dialogs/UserActionDialogs.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Key, Lock, Trash2, Eye, EyeOff, X } from 'lucide-react';

// Diálogo de confirmação genérico
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  variant = 'default',
  isLoading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex items-center space-x-3">
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 ${variantStyles[variant]}`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                confirmText
              )}
            </Button>
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1" 
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Diálogo para resetar senha
interface ResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sendEmail: boolean) => void;
  userName: string;
  isLoading?: boolean;
}

export function ResetPasswordDialog({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading = false
}: ResetPasswordDialogProps) {
  const [sendEmail, setSendEmail] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-orange-500" />
            <span>Resetar Senha</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja resetar a senha do usuário <strong>{userName}</strong>?
          </p>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">Enviar nova senha por email</span>
            </label>
            
            {!sendEmail && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Atenção:</strong> Uma senha temporária será gerada e exibida na tela. 
                  Certifique-se de anotá-la e entregá-la ao usuário com segurança.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => onConfirm(sendEmail)}
              disabled={isLoading}
              className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Resetando...
                </>
              ) : (
                'Resetar Senha'
              )}
            </Button>
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1" 
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Diálogo para bloquear usuário
interface BlockUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (duration: number, reason: string) => void;
  userName: string;
  isLoading?: boolean;
}

export function BlockUserDialog({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading = false
}: BlockUserDialogProps) {
  const [duration, setDuration] = useState(30);
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const durationOptions = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 120, label: '2 horas' },
    { value: 240, label: '4 horas' },
    { value: 480, label: '8 horas' },
    { value: 1440, label: '24 horas' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-yellow-500" />
            <span>Bloquear Usuário</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Bloquear temporariamente o usuário <strong>{userName}</strong>?
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Duração do bloqueio
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Motivo (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva o motivo do bloqueio..."
                rows={3}
                className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md resize-none"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => onConfirm(duration, reason)}
              disabled={isLoading}
              className="flex-1 bg-yellow-600 text-white hover:bg-yellow-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Bloqueando...
                </>
              ) : (
                'Bloquear'
              )}
            </Button>
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1" 
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Diálogo para alterar senha
interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (currentPassword: string, newPassword: string, confirmPassword: string) => void;
  isLoading?: boolean;
  requireCurrentPassword?: boolean;
}

export function ChangePasswordDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  requireCurrentPassword = true
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (requireCurrentPassword && !currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm(currentPassword, newPassword, confirmPassword);
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-500" />
            <span>Alterar Senha</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {requireCurrentPassword && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Senha atual *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (errors.currentPassword) {
                        setErrors(prev => ({ ...prev, currentPassword: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 pr-10 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                      errors.currentPassword ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="Digite a senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-600 text-xs mt-1">{errors.currentPassword}</p>
                )}
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nova senha *
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) {
                    setErrors(prev => ({ ...prev, newPassword: '' }));
                  }
                }}
                className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                  errors.newPassword ? 'border-red-500' : 'border-input'
                }`}
                placeholder="Digite a nova senha"
              />
              {errors.newPassword && (
                <p className="text-red-600 text-xs mt-1">{errors.newPassword}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Confirmar nova senha *
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                  errors.confirmPassword ? 'border-red-500' : 'border-input'
                }`}
                placeholder="Confirme a nova senha"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Alterando...
                </>
              ) : (
                'Alterar Senha'
              )}
            </Button>
            <Button 
              onClick={resetForm} 
              variant="outline" 
              className="flex-1" 
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Diálogo para mostrar senha temporária
interface ShowTemporaryPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  temporaryPassword: string;
  userName: string;
}

export function ShowTemporaryPasswordDialog({
  isOpen,
  onClose,
  temporaryPassword,
  userName
}: ShowTemporaryPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-green-500" />
            <span>Senha Temporária Gerada</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nova senha temporária para o usuário <strong>{userName}</strong>:
          </p>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
            <div className="flex items-center justify-between">
              <code className="text-lg font-mono font-bold">{temporaryPassword}</code>
              <Button
                onClick={copyPassword}
                size="sm"
                variant="outline"
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </div>
          
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>Importante:</strong> Anote esta senha e entregue-a ao usuário com segurança. 
              Esta informação não será exibida novamente.
            </p>
          </div>
          
          <Button onClick={onClose} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}