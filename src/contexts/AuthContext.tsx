// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService, LoginRequest, LoginResponse } from '@/lib/api';
import { TokenValidator } from '@/lib/token-validator';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: LoginResponse['usuario'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  selectedTenant: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setTenant: (tenant: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<LoginResponse['usuario'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const router = useRouter();

  // Função para lidar com token inválido
  const handleInvalidToken = () => {
    console.log('🚪 Token inválido, fazendo logout...');
    apiService.logout();
    setUser(null);
    setIsLoading(false);
    router.push('/login');
  };

  // Configurar interceptor de token uma única vez
  useEffect(() => {
    const tokenValidator = TokenValidator.getInstance();
    
    // Configurar interceptor de resposta HTTP
    tokenValidator.setupResponseInterceptor();
    
    // Adicionar callback para token inválido
    tokenValidator.addInvalidTokenCallback(handleInvalidToken);
    
    // Cleanup
    return () => {
      tokenValidator.removeInvalidTokenCallback(handleInvalidToken);
    };
  }, []);

  // Verificar autenticação ao inicializar
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 Inicializando autenticação...');
        
        // Verificar se há tenant selecionado
        const currentTenant = apiService.getCurrentTenant();
        console.log('🏢 Tenant atual:', currentTenant);
        setSelectedTenant(currentTenant);

        if (currentTenant && apiService.isAuthenticated()) {
          console.log('✅ Tenant e token presentes, verificando usuário...');
          
          const storedUser = apiService.getStoredUser();
          if (storedUser) {
            console.log('👤 Usuário encontrado no storage:', storedUser.nome);
            setUser(storedUser);
          } else {
            console.log('🔍 Buscando dados do usuário na API...');
            try {
              const userData = await apiService.getUserProfile();
              console.log('✅ Dados do usuário obtidos da API:', userData.nome);
              setUser(userData);
            } catch (error) {
              console.error('❌ Erro ao obter perfil do usuário:', error);
              // Token inválido ou expirado
              handleInvalidToken();
              return;
            }
          }
        } else {
          console.log('ℹ️ Não autenticado ou sem tenant');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        handleInvalidToken();
        return;
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const setTenant = (tenant: string) => {
    console.log('🏢 Context: Definindo tenant:', tenant);
    apiService.setTenant(tenant);
    setSelectedTenant(tenant);
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      //setError(''); // Limpar erros anteriores
      
      console.log('🔐 Iniciando login...');
      
      // Verificar se tenant está definido
      if (!apiService.hasTenant()) {
        throw new Error('Tenant não definido. Selecione um município primeiro.');
      }
      
      console.log('🏢 Tenant confirmado:', apiService.getCurrentTenant());
      console.log('👤 Fazendo login para usuário:', credentials.usuario);
      
      const response = await apiService.login(credentials);

      console.log('response: ', response);
      
      
      console.log('✅ Login bem-sucedido:', {
        usuario: response.usuario.nome,
        papel: response.usuario.papel,
        tenant: response.usuario.tenant_id
      });
      
      setUser(response.usuario);
      
      // Redirecionar para dashboard
      console.log('🚀 Redirecionando para dashboard...');
      router.push('/dashboard');
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setIsLoading(false);
      throw error; // Re-throw para que o componente de login possa exibir o erro
    }
    // Note: não fazemos setIsLoading(false) aqui no sucesso para evitar flash
    // O loading só será desativado quando o componente de dashboard carregar
  };

  const logout = () => {
    console.log('🚪 Fazendo logout...');
    apiService.logout();
    setUser(null);
    setIsLoading(false);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      if (apiService.isAuthenticated() && apiService.hasTenant()) {
        console.log('🔄 Atualizando dados do usuário...');
        const userData = await apiService.getUserProfile();
        setUser(userData);
        console.log('✅ Dados do usuário atualizados');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar dados do usuário:', error);
      // Token pode ter expirado
      handleInvalidToken();
    }
  };

  // Validação automática de token a cada 5 minutos
  useEffect(() => {
    if (!user || !apiService.isAuthenticated()) return;

    const validateToken = async () => {
      try {
        await apiService.getUserProfile();
        console.log('✅ Token ainda válido');
      } catch (error) {
        console.log('❌ Token expirado ou inválido');
        handleInvalidToken();
      }
    };

    // Validar imediatamente e depois a cada 5 minutos
    const interval = setInterval(validateToken, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && apiService.isAuthenticated(),
    selectedTenant,
    login,
    logout,
    setTenant,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}