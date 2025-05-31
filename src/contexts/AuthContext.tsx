// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService, LoginRequest, LoginResponse } from '@/lib/api';
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

  // Inicialização única
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 === INICIALIZANDO AUTH ===');
        
        // 1. Recuperar tenant
        const currentTenant = apiService.getCurrentTenant();
        console.log('🏢 Tenant atual:', currentTenant);
        
        if (mounted) {
          setSelectedTenant(currentTenant);
        }

        // 2. Verificar se está autenticado
        if (currentTenant && apiService.isAuthenticated()) {
          console.log('✅ Usuário parece estar autenticado');
          
          // 3. Tentar obter dados do usuário
          const storedUser = apiService.getStoredUser();
          if (storedUser && mounted) {
            console.log('👤 Usuário encontrado:', storedUser.nome);
            setUser(storedUser);
          } else {
            console.log('🔍 Buscando dados na API...');
            try {
              const userData = await apiService.getUserProfile();
              if (mounted) {
                console.log('✅ Dados obtidos da API:', userData.nome);
                setUser(userData);
              }
            } catch (error) {
              console.error('❌ Erro ao buscar usuário:', error);
              // Limpar dados inválidos
              apiService.logout();
              if (mounted) {
                setUser(null);
              }
            }
          }
        } else {
          console.log('ℹ️ Usuário não autenticado');
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          console.log('🏁 Inicialização concluída');
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []); // Apenas uma vez

  const setTenant = (tenant: string) => {
    console.log('🏢 Definindo tenant:', tenant);
    apiService.setTenant(tenant);
    setSelectedTenant(tenant);
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      console.log('🔐 Fazendo login...');
      
      if (!apiService.hasTenant()) {
        throw new Error('Tenant não definido');
      }
      
      const response = await apiService.login(credentials);
      console.log('✅ Login realizado:', response.usuario.nome);
      
      setUser(response.usuario);
      
      // Não fazer redirecionamento aqui - deixar o componente decidir
      console.log('✅ Usuário definido no contexto');
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setIsLoading(false);
      throw error;
    }
    // Loading permanece true até redirecionamento
  };

  const logout = () => {
    console.log('🚪 Fazendo logout...');
    apiService.logout();
    setUser(null);
    setSelectedTenant(apiService.getCurrentTenant());
    setIsLoading(false);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      if (apiService.isAuthenticated() && apiService.hasTenant()) {
        const userData = await apiService.getUserProfile();
        setUser(userData);
        console.log('✅ Usuário atualizado');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      logout();
    }
  };

  // Estado de autenticação
  const isAuthenticated = !!(user && selectedTenant && apiService.isAuthenticated());

  // Log de estado
  useEffect(() => {
    console.log('📊 Auth State:', {
      user: user?.nome || null,
      isLoading,
      isAuthenticated,
      selectedTenant,
      apiDebug: apiService.getDebugInfo()
    });
  }, [user, isLoading, isAuthenticated, selectedTenant]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
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