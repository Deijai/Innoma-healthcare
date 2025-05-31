// src/components/ui/Toast.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// ===================================
// INTERFACES E TIPOS
// ===================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, options?: Partial<Toast>) => string;
  error: (title: string, message?: string, options?: Partial<Toast>) => string;
  warning: (title: string, message?: string, options?: Partial<Toast>) => string;
  info: (title: string, message?: string, options?: Partial<Toast>) => string;
  clear: () => void;
}

// ===================================
// CONTEXTO DO TOAST
// ===================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
};

// ===================================
// COMPONENTE DE TOAST INDIVIDUAL
// ===================================

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast.persistent && toast.duration !== 0) {
      const duration = toast.duration || getDefaultDuration(toast.type);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
      toast.onClose?.();
    }, 300); // Tempo da animação de saída
  };

  const getIcon = () => {
    const iconClass = "h-5 w-5";
    switch (toast.type) {
      case 'success':
        return <CheckCircle className={cn(iconClass, 'text-green-600')} />;
      case 'error':
        return <AlertCircle className={cn(iconClass, 'text-red-600')} />;
      case 'warning':
        return <AlertTriangle className={cn(iconClass, 'text-yellow-600')} />;
      case 'info':
        return <Info className={cn(iconClass, 'text-blue-600')} />;
      default:
        return <Info className={cn(iconClass, 'text-gray-600')} />;
    }
  };

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700';
    }
  };

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
        getTypeStyles(),
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
        isLeaving && 'translate-x-full opacity-0'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {toast.title}
            </p>
            {toast.message && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {toast.message}
              </p>
            )}
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    toast.action!.onClick();
                    handleClose();
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Barra de progresso para toasts temporários */}
      {!toast.persistent && toast.duration !== 0 && (
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-current opacity-30 transition-all ease-linear"
            style={{
              animation: `toast-progress ${toast.duration || getDefaultDuration(toast.type)}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

// ===================================
// CONTAINER DE TOASTS
// ===================================

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right',
  maxToasts = 5
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  // Limitar número de toasts visíveis
  const visibleToasts = toasts.slice(0, maxToasts);

  return createPortal(
    <div
      className={cn(
        'pointer-events-none fixed z-50 flex flex-col space-y-4',
        getPositionStyles()
      )}
    >
      {visibleToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
      
      {/* Indicador de toasts adicionais */}
      {toasts.length > maxToasts && (
        <div className="pointer-events-auto rounded-lg bg-gray-800 px-3 py-2 text-sm text-white">
          +{toasts.length - maxToasts} mais notificações
        </div>
      )}
    </div>,
    document.body
  );
};

// ===================================
// PROVIDER DO TOAST
// ===================================

interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      duration: getDefaultDuration(toast.type),
      ...toast
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'success', title, message, ...options });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'error', title, message, ...options });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'warning', title, message, ...options });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'info', title, message, ...options });
  }, [addToast]);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clear
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer 
        toasts={toasts} 
        onRemove={removeToast} 
        position={position}
        maxToasts={maxToasts}
      />
      <style jsx global>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

// ===================================
// UTILITÁRIOS
// ===================================

const getDefaultDuration = (type: ToastType): number => {
  switch (type) {
    case 'success':
      return 3000;
    case 'info':
      return 4000;
    case 'warning':
      return 5000;
    case 'error':
      return 6000;
    default:
      return 4000;
  }
};

// ===================================
// COMPONENTE DE TOAST IMPERATIVO
// ===================================

interface ToastMessageProps {
  type: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ToastMessage: React.FC<ToastMessageProps> = ({
  type,
  title,
  message,
  onClose,
  action
}) => {
  const getIcon = () => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'success':
        return <CheckCircle className={cn(iconClass, 'text-green-600')} />;
      case 'error':
        return <AlertCircle className={cn(iconClass, 'text-red-600')} />;
      case 'warning':
        return <AlertTriangle className={cn(iconClass, 'text-yellow-600')} />;
      case 'info':
        return <Info className={cn(iconClass, 'text-blue-600')} />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className={cn('rounded-lg border p-4', getTypeStyles())}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {message && (
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {message}
            </p>
          )}
          {action && (
            <div className="mt-3">
              <button
                onClick={action.onClick}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        
        {onClose && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ===================================
// HOOKS AVANÇADOS
// ===================================

// Hook para toast com promise
export const useAsyncToast = () => {
  const toast = useToast();

  const promiseToast = useCallback(async <T,>(
    promise: Promise<T>,
    options: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: any) => string);
    }
  ) => {
    const loadingId = toast.info(options.loading || 'Carregando...', undefined, {
      persistent: true
    });

    try {
      const result = await promise;
      toast.removeToast(loadingId);
      
      const successMessage = typeof options.success === 'function' 
        ? options.success(result)
        : options.success || 'Operação realizada com sucesso';
        
      toast.success(successMessage);
      return result;
    } catch (error) {
      toast.removeToast(loadingId);
      
      const errorMessage = typeof options.error === 'function'
        ? options.error(error)
        : options.error || 'Erro na operação';
        
      toast.error(errorMessage);
      throw error;
    }
  }, [toast]);

  return { ...toast, promiseToast };
};

// Hook para toast com confirmação
export const useConfirmToast = () => {
  const toast = useToast();

  const confirmToast = useCallback((
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmLabel?: string;
      cancelLabel?: string;
      type?: ToastType;
    }
  ) => {
    return toast.addToast({
      type: options?.type || 'warning',
      title,
      message,
      persistent: true,
      action: {
        label: options?.confirmLabel || 'Confirmar',
        onClick: async () => {
          try {
            await onConfirm();
          } catch (error) {
            toast.error('Erro ao executar ação');
          }
        }
      }
    });
  }, [toast]);

  return { ...toast, confirmToast };
};

// ===================================
// COMPONENTES DE TOAST ESPECÍFICOS
// ===================================

// Toast de progresso
interface ProgressToastProps {
  title: string;
  progress: number; // 0-100
  message?: string;
  onCancel?: () => void;
}

export const ProgressToast: React.FC<ProgressToastProps> = ({
  title,
  progress,
  message,
  onCancel
}) => {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:bg-blue-900/20">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {message && (
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {message}
            </p>
          )}
          
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {Math.round(progress)}% concluído
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {onCancel && (
            <div className="mt-3">
              <button
                onClick={onCancel}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Toast de conexão/status
interface ConnectionToastProps {
  status: 'online' | 'offline' | 'reconnecting';
  onRetry?: () => void;
}

export const ConnectionToast: React.FC<ConnectionToastProps> = ({
  status,
  onRetry
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          title: 'Conectado',
          message: 'Conexão restaurada com sucesso',
          className: 'border-green-200 bg-green-50 dark:bg-green-900/20'
        };
      case 'offline':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          title: 'Sem conexão',
          message: 'Verifique sua conexão com a internet',
          className: 'border-red-200 bg-red-50 dark:bg-red-900/20'
        };
      case 'reconnecting':
        return {
          icon: <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-600 border-t-transparent" />,
          title: 'Reconectando...',
          message: 'Tentando restabelecer a conexão',
          className: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={cn('rounded-lg border p-4', config.className)}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {config.title}
          </h3>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {config.message}
          </p>
          
          {status === 'offline' && onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===================================
// TOAST DE FORMULÁRIO/VALIDAÇÃO
// ===================================

interface FormToastProps {
  errors: Record<string, string>;
  onClose?: () => void;
}

export const FormValidationToast: React.FC<FormToastProps> = ({
  errors,
  onClose
}) => {
  const errorCount = Object.keys(errors).length;

  if (errorCount === 0) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:bg-red-900/20">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {errorCount === 1 ? 'Erro de validação' : `${errorCount} erros de validação`}
          </h3>
          
          <div className="mt-2">
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {onClose && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex rounded-md bg-transparent text-red-400 hover:text-red-500 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ===================================
// TOAST DE ATUALIZAÇÃO/VERSÃO
// ===================================

interface UpdateToastProps {
  version: string;
  onUpdate: () => void;
  onDismiss?: () => void;
}

export const UpdateAvailableToast: React.FC<UpdateToastProps> = ({
  version,
  onUpdate,
  onDismiss
}) => {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:bg-blue-900/20">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-600" />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Atualização disponível
          </h3>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            Nova versão {version} disponível. Atualize para obter as últimas funcionalidades.
          </p>
          
          <div className="mt-3 flex space-x-3">
            <button
              onClick={onUpdate}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Atualizar agora
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                Mais tarde
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================================
// HOOK PARA TOAST DE SISTEMA
// ===================================

export const useSystemToast = () => {
  const toast = useToast();

  const showNetworkError = useCallback(() => {
    return toast.error(
      'Erro de conexão',
      'Verifique sua conexão com a internet e tente novamente',
      { persistent: true }
    );
  }, [toast]);

  const showAuthError = useCallback(() => {
    return toast.error(
      'Sessão expirada',
      'Faça login novamente para continuar',
      {
        action: {
          label: 'Fazer login',
          onClick: () => window.location.href = '/login'
        }
      }
    );
  }, [toast]);

  const showPermissionError = useCallback(() => {
    return toast.warning(
      'Acesso negado',
      'Você não tem permissão para realizar esta ação'
    );
  }, [toast]);

  const showSaveSuccess = useCallback((itemName: string = 'Item') => {
    return toast.success(`${itemName} salvo com sucesso`);
  }, [toast]);

  const showDeleteSuccess = useCallback((itemName: string = 'Item') => {
    return toast.success(`${itemName} excluído com sucesso`);
  }, [toast]);

  const showValidationError = useCallback((errors: Record<string, string>) => {
    const errorCount = Object.keys(errors).length;
    const message = errorCount === 1 
      ? Object.values(errors)[0]
      : `${errorCount} campos precisam ser corrigidos`;
    
    return toast.error('Erro de validação', message);
  }, [toast]);

  return {
    ...toast,
    showNetworkError,
    showAuthError,
    showPermissionError,
    showSaveSuccess,
    showDeleteSuccess,
    showValidationError
  };
};

// ===================================
// EXPORTAÇÕES PADRÃO
// ===================================

export default {
  Provider: ToastProvider,
  useToast,
  useAsyncToast,
  useConfirmToast,
  useSystemToast,
  ToastMessage,
  ProgressToast,
  ConnectionToast,
  FormValidationToast,
  UpdateAvailableToast
};