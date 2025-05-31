// src/components/layout/Header.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Sun, Moon, User, Settings, LogOut, Bell, Shield } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { theme, setTheme, mounted } = useTheme();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Evita hidratação até que o componente esteja montado no cliente
  if (!mounted) {
    return (
      <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Carregando...</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Sun className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Usuário</span>
          </Button>
        </div>
      </header>
    );
  }

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'text-blue-600 dark:text-blue-400',
      'MEDICO': 'text-green-600 dark:text-green-400',
      'ENFERMEIRO': 'text-purple-600 dark:text-purple-400',
      'RECEPCIONISTA': 'text-orange-600 dark:text-orange-400',
      'FARMACEUTICO': 'text-cyan-600 dark:text-cyan-400',
      'LABORATORISTA': 'text-pink-600 dark:text-pink-400',
      'GESTOR': 'text-indigo-600 dark:text-indigo-400',
    };
    return colors[role] || 'text-gray-600 dark:text-gray-400';
  };

  const getRoleDisplayName = (role: string) => {
    const names: Record<string, string> = {
      'ADMIN': 'Administrador',
      'MEDICO': 'Médico',
      'ENFERMEIRO': 'Enfermeiro',
      'RECEPCIONISTA': 'Recepcionista',
      'FARMACEUTICO': 'Farmacêutico',
      'LABORATORISTA': 'Laboratorista',
      'GESTOR': 'Gestor',
    };
    return names[role] || role;
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-xl font-semibold">
            Olá, {user?.nome || user?.usuario || 'Usuário'}
          </h1>
          {user?.papel && (
            <p className={`text-sm ${getRoleColor(user.papel)}`}>
              {getRoleDisplayName(user.papel)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Toggle Tema */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notificações */}
        <Button variant="ghost" size="sm" title="Notificações">
          <Bell className="h-4 w-4" />
        </Button>

        {/* Menu do Usuário */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left hidden md:block">
              <span className="text-sm font-medium">{user?.nome || user?.usuario}</span>
              {user?.papel && (
                <p className={`text-xs ${getRoleColor(user.papel)}`}>
                  {getRoleDisplayName(user.papel)}
                </p>
              )}
            </div>
          </Button>

          {showUserMenu && (
            <>
              {/* Overlay para fechar o menu */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              
              {/* Menu dropdown */}
              <div className="absolute right-0 mt-2 w-64 bg-card border border-border shadow-lg rounded-md z-20">
                {/* Cabeçalho do menu */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user?.nome || user?.usuario}</p>
                      {user?.papel && (
                        <p className={`text-xs ${getRoleColor(user.papel)}`}>
                          {getRoleDisplayName(user.papel)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informações do usuário */}
                <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
                  <p>ID: {user?.id}</p>
                  <p>Tenant: {user?.tenant_id}</p>
                  {user?.permissoes && user.permissoes.length > 0 && (
                    <p className="mt-1">
                      <Shield className="h-3 w-3 inline mr-1" />
                      {user.permissoes.length} permissões
                    </p>
                  )}
                </div>

                {/* Opções do menu */}
                <div className="py-1">
                  <button 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Meu Perfil
                  </button>
                  <button 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Configurações
                  </button>
                  
                  <hr className="my-1 border-border" />
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sair do Sistema
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}