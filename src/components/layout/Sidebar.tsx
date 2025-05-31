// src/components/layout/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Users,
  Settings,
  BarChart3,
  FileText,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Heart,
  Calendar,
  Building2,
  Pill,
  UserCheck,
  Shield,
} from 'lucide-react';

interface MenuItem {
  title: string;
  href?: string;
  icon: any;
  children?: MenuItem[];
  permissions?: string[]; // Permissões necessárias para ver este item
  roles?: string[]; // Papéis que podem ver este item
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Pessoas',
    icon: Users,
    permissions: ['VISUALIZAR_PACIENTE', 'CADASTRAR_PACIENTE', 'GERENCIAR_USUARIOS'],
    children: [
      { 
        title: 'Lista de Pessoas', 
        href: '/dashboard/people', 
        icon: Users,
        permissions: ['VISUALIZAR_PACIENTE', 'CADASTRAR_PACIENTE']
      },
      { 
        title: 'Pacientes', 
        href: '/dashboard/patients', 
        icon: Heart,
        permissions: ['VISUALIZAR_PACIENTE']
      },
      { 
        title: 'Médicos', 
        href: '/dashboard/doctors', 
        icon: UserCheck,
        permissions: ['VISUALIZAR_MEDICO']
      },
    ],
  },
  {
    title: 'Atendimento',
    icon: Calendar,
    permissions: ['AGENDAR_CONSULTA', 'VISUALIZAR_AGENDA', 'REALIZAR_ATENDIMENTO'],
    children: [
      { 
        title: 'Agendamentos', 
        href: '/dashboard/appointments', 
        icon: Calendar,
        permissions: ['AGENDAR_CONSULTA', 'VISUALIZAR_AGENDA']
      },
      { 
        title: 'Consultas', 
        href: '/dashboard/consultations', 
        icon: Heart,
        permissions: ['REALIZAR_ATENDIMENTO']
      },
    ],
  },
  {
    title: 'Gestão',
    icon: Building2,
    permissions: ['GERENCIAR_UNIDADES', 'VISUALIZAR_FINANCEIRO', 'GERENCIAR_ESTOQUE'],
    children: [
      { 
        title: 'Unidades', 
        href: '/dashboard/units', 
        icon: Building2,
        permissions: ['GERENCIAR_UNIDADES']
      },
      { 
        title: 'Medicamentos', 
        href: '/dashboard/medications', 
        icon: Pill,
        permissions: ['GERENCIAR_ESTOQUE']
      },
      { 
        title: 'Financeiro', 
        href: '/dashboard/financial', 
        icon: ShoppingCart,
        permissions: ['VISUALIZAR_FINANCEIRO']
      },
    ],
  },
  {
    title: 'Usuários',
    icon: Users,
    permissions: ['GERENCIAR_USUARIOS'],
    roles: ['ADMIN'],
    children: [
      { 
        title: 'Lista de Usuários', 
        href: '/dashboard/users', 
        icon: Users,
        permissions: ['GERENCIAR_USUARIOS']
      },
      { 
        title: 'Perfis e Permissões', 
        href: '/dashboard/users/profiles', 
        icon: Shield,
        permissions: ['GERENCIAR_USUARIOS']
      },
    ],
  },
  {
    title: 'Relatórios',
    href: '/dashboard/reports',
    icon: BarChart3,
    permissions: ['GERAR_RELATORIOS'],
  },
  {
    title: 'Documentos',
    href: '/dashboard/documents',
    icon: FileText,
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
    permissions: ['CONFIGURAR_SISTEMA'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  // Verificar se o usuário tem permissão para ver um item
  const hasPermission = (item: MenuItem): boolean => {
    // Se não há restrições, permitir acesso
    if (!item.permissions && !item.roles) {
      return true;
    }

    // Verificar papéis
    if (item.roles && user?.papel) {
      if (!item.roles.includes(user.papel)) {
        return false;
      }
    }

    // Admin tem acesso a tudo
    if (user?.papel === 'ADMIN') {
      return true;
    }

    // Verificar permissões específicas
    if (item.permissions && user?.permissoes) {
      return item.permissions.some(permission => 
        user.permissoes.includes(permission)
      );
    }

    // Se há restrições mas usuário não tem permissões, negar acesso
    if (item.permissions || item.roles) {
      return false;
    }

    return true;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    // Verificar permissão antes de renderizar
    if (!hasPermission(item)) {
      return null;
    }

    const Icon = item.icon;
    const isExpanded = expandedItems.includes(item.title);
    const isActive = item.href === pathname;

    // Filtrar filhos com base em permissões
    const allowedChildren = item.children?.filter(child => hasPermission(child)) || [];

    if (item.children && allowedChildren.length > 0) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={`w-full flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${
              level > 0 ? 'pl-8' : ''
            }`}
          >
            <Icon className="h-4 w-4 mr-3" />
            <span className="flex-1 text-left">{item.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4">
              {allowedChildren.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Se não tem filhos permitidos mas tem href, renderizar como link
    if (item.href) {
      return (
        <Link
          key={item.title}
          href={item.href}
          className={`flex items-center px-4 py-2 text-sm transition-colors ${
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          } ${level > 0 ? 'pl-8' : ''}`}
        >
          <Icon className="h-4 w-4 mr-3" />
          {item.title}
        </Link>
      );
    }

    return null;
  };

  // Filtrar itens principais com base em permissões
  const allowedMenuItems = menuItems.filter(item => hasPermission(item));

  return (
    <div className="w-64 bg-card border-r border-border h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Sistema de Saúde</h2>
        {user && (
          <p className="text-xs text-muted-foreground mt-1">
            {user.nome || user.usuario}
          </p>
        )}
      </div>
      <nav className="px-2">
        {allowedMenuItems.map(item => renderMenuItem(item))}
      </nav>
    </div>
  );
}