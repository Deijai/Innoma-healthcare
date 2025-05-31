// src/app/dashboard/layout.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/providers/ThemeProvider';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Home,
  Users,
  Settings,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronRight,
  Heart,
  Calendar,
  Building2,
  Pill,
  UserCheck,
  Shield,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Loader2
} from 'lucide-react';

interface MenuItem {
  title: string;
  href?: string;
  icon: any;
  children?: MenuItem[];
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Home },
  {
    title: 'Pessoas',
    icon: Users,
    children: [
      { title: 'Pacientes', href: '/dashboard/patients', icon: Heart },
      { title: 'Médicos', href: '/dashboard/doctors', icon: UserCheck },
    ],
  },
  {
    title: 'Atendimento',
    icon: Calendar,
    children: [
      { title: 'Agendamentos', href: '/dashboard/appointments', icon: Calendar },
      { title: 'Consultas', href: '/dashboard/consultations', icon: Heart },
    ],
  },
  {
    title: 'Gestão',
    icon: Building2,
    children: [
      { title: 'Unidades', href: '/dashboard/units', icon: Building2 },
      { title: 'Medicamentos', href: '/dashboard/medications', icon: Pill },
      { title: 'Financeiro', href: '/dashboard/financial', icon: BarChart3 },
    ],
  },
  {
    title: 'Usuários',
    icon: Users,
    roles: ['ADMIN'],
    children: [
      { title: 'Lista de Usuários', href: '/dashboard/users', icon: Users },
      { title: 'Perfis e Permissões', href: '/dashboard/users/profiles', icon: Shield },
    ],
  },
  { title: 'Relatórios', href: '/dashboard/reports', icon: BarChart3 },
  { title: 'Documentos', href: '/dashboard/documents', icon: FileText },
  { title: 'Configurações', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { theme, setTheme, mounted } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Dashboard']);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fechar sidebar em mobile ao navegar
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Vai redirecionar
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const hasPermission = (item: MenuItem): boolean => {
    if (!item.roles) return true;
    if (user?.papel === 'ADMIN') return true;
    return item.roles.includes(user.papel);
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!hasPermission(item)) return null;

    const Icon = item.icon;
    const isExpanded = expandedItems.includes(item.title);
    const isActive = item.href === pathname;
    const allowedChildren = item.children?.filter(hasPermission) || [];

    if (item.children && allowedChildren.length > 0) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={`w-full flex items-center px-4 py-3 text-sm transition-colors hover:bg-accent ${
              level > 0 ? 'pl-8' : ''
            }`}
          >
            <Icon className="h-4 w-4 mr-3 text-muted-foreground" />
            <span className="flex-1 text-left font-medium">{item.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {isExpanded && (
            <div className="bg-accent/20">
              {allowedChildren.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    if (item.href) {
      return (
        <Link
          key={item.title}
          href={item.href}
          className={`flex items-center px-4 py-3 text-sm transition-colors rounded-md mx-2 ${
            isActive
              ? 'bg-primary text-primary-foreground font-medium'
              : 'hover:bg-accent'
          } ${level > 0 ? 'pl-8' : ''}`}
        >
          <Icon className="h-4 w-4 mr-3" />
          {item.title}
        </Link>
      );
    }

    return null;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'text-blue-600 dark:text-blue-400',
      'MEDICO': 'text-green-600 dark:text-green-400',
      'ENFERMEIRO': 'text-purple-600 dark:text-purple-400',
      'RECEPCIONISTA': 'text-orange-600 dark:text-orange-400',
    };
    return colors[role] || 'text-gray-600 dark:text-gray-400';
  };

  const firstName = user.nome.split(' ')[0];

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:relative lg:transform-none lg:transition-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Sistema de Saúde</h2>
                <p className="text-xs text-muted-foreground">
                  {user.tenant_id}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {menuItems.filter(hasPermission).map(item => renderMenuItem(item))}
          </nav>

          {/* User Info na Sidebar */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{firstName}</p>
                <p className={`text-xs ${getRoleColor(user.papel)}`}>
                  {user.papel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div>
              <h1 className="text-xl font-semibold">
                Bom dia, {firstName}!
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle Tema */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Notificações */}
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            {/* User Menu */}
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
                <span className="hidden md:inline text-sm">{firstName}</span>
              </Button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border shadow-lg rounded-md z-20">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-medium text-sm">{user.nome}</p>
                      <p className={`text-xs ${getRoleColor(user.papel)}`}>
                        {user.papel}
                      </p>
                      <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                    </div>

                    <div className="py-1">
                      <button 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Meu Perfil
                      </button>
                      <button 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Configurações
                      </button>
                      
                      <hr className="my-1 border-border" />
                      
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
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

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}