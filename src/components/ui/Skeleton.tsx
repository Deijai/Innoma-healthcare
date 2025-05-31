// src/components/ui/Skeleton.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ===================================
// SKELETON BASE
// ===================================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = false,
  animate = true
}) => {
  const style: React.CSSProperties = {};
  
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        'bg-muted',
        rounded ? 'rounded-full' : 'rounded-md',
        animate && 'animate-pulse',
        className
      )}
      style={style}
    />
  );
};

// ===================================
// SKELETON DE TEXTO
// ===================================

interface TextSkeletonProps {
  lines?: number;
  className?: string;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({ 
  lines = 1, 
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton
        key={i}
        className="h-4"
        width={i === lines - 1 ? '75%' : '100%'}
      />
    ))}
  </div>
);

// ===================================
// SKELETON DE AVATAR
// ===================================

interface AvatarSkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarSkeleton: React.FC<AvatarSkeletonProps> = ({ 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <Skeleton
      className={cn(sizeClasses[size], className)}
      rounded
    />
  );
};

// ===================================
// SKELETON DE CARTÃO
// ===================================

interface CardSkeletonProps {
  showHeader?: boolean;
  showAvatar?: boolean;
  lines?: number;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showHeader = true,
  showAvatar = false,
  lines = 3,
  className
}) => (
  <div className={cn('p-6 border border-border rounded-lg space-y-4', className)}>
    {showHeader && (
      <div className="flex items-center space-x-3">
        {showAvatar && <AvatarSkeleton />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    )}
    
    <div className="space-y-3">
      <TextSkeleton lines={lines} />
    </div>
    
    <div className="flex space-x-2 pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

// ===================================
// SKELETON DE TABELA
// ===================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className
}) => (
  <div className={cn('space-y-4', className)}>
    {showHeader && (
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-border">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
    )}
    
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4 border-b border-border">
        {Array.from({ length: columns }, (_, colIndex) => (
          <Skeleton key={colIndex} className="h-4" />
        ))}
      </div>
    ))}
  </div>
);

// ===================================
// SKELETON DE FORMULÁRIO
// ===================================

interface FormSkeletonProps {
  fields?: number;
  showButtons?: boolean;
  className?: string;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 6,
  showButtons = true,
  className
}) => (
  <div className={cn('space-y-6', className)}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
    
    {showButtons && (
      <div className="flex justify-end space-x-3 pt-4 border-t border-border">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    )}
  </div>
);

// ===================================
// SKELETON DE LISTA
// ===================================

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showAction?: boolean;
  className?: string;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 5,
  showAvatar = true,
  showAction = true,
  className
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
        {showAvatar && <AvatarSkeleton />}
        
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        
        {showAction && (
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        )}
      </div>
    ))}
  </div>
);

// ===================================
// SKELETON DE DASHBOARD
// ===================================

interface DashboardSkeletonProps {
  className?: string;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ 
  className 
}) => (
  <div className={cn('space-y-6', className)}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex space-x-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
    
    {/* Métricas */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <CardSkeleton key={i} showHeader={false} lines={1} />
      ))}
    </div>
    
    {/* Conteúdo principal */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CardSkeleton showHeader lines={8} />
      </div>
      <div>
        <CardSkeleton showHeader lines={5} />
      </div>
    </div>
  </div>
);

// ===================================
// SKELETON DE DETALHES DE USUÁRIO
// ===================================

interface UserDetailSkeletonProps {
  className?: string;
}

export const UserDetailSkeleton: React.FC<UserDetailSkeletonProps> = ({ 
  className 
}) => (
  <div className={cn('space-y-6', className)}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-6 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      <div className="flex space-x-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
    
    {/* Conteúdo */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <CardSkeleton showHeader lines={4} />
        <CardSkeleton showHeader lines={3} />
        <CardSkeleton showHeader lines={5} />
      </div>
      
      <div className="space-y-6">
        <CardSkeleton showHeader={false} lines={2} />
        <CardSkeleton showHeader lines={6} />
        <CardSkeleton showHeader lines={3} />
      </div>
    </div>
  </div>
);

// ===================================
// SKELETON DE PÁGINA DE GESTÃO
// ===================================

interface ManagementPageSkeletonProps {
  className?: string;
}

export const ManagementPageSkeleton: React.FC<ManagementPageSkeletonProps> = ({ 
  className 
}) => (
  <div className={cn('space-y-6', className)}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex space-x-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
    
    {/* Barra de busca e filtros */}
    <div className="p-6 border border-border rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
    
    {/* Lista/Tabela */}
    <div className="border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <Skeleton className="h-6 w-48" />
      </div>
      <ListSkeleton items={8} />
    </div>
    
    {/* Paginação */}
    <div className="p-4 border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-64" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  </div>
);

// ===================================
// SKELETON DE BUSCA COM RESULTADOS
// ===================================

interface SearchResultsSkeletonProps {
  results?: number;
  showFilters?: boolean;
  className?: string;
}

export const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({
  results = 6,
  showFilters = true,
  className
}) => (
  <div className={cn('space-y-4', className)}>
    {/* Barra de busca */}
    <div className="flex items-center space-x-4">
      <Skeleton className="h-10 flex-1" />
      {showFilters && <Skeleton className="h-10 w-24" />}
    </div>
    
    {/* Filtros */}
    {showFilters && (
      <div className="p-4 border border-border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>
    )}
    
    {/* Resultados */}
    <div className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: results }, (_, i) => (
          <CardSkeleton key={i} showAvatar lines={2} />
        ))}
      </div>
    </div>
  </div>
);

// ===================================
// SKELETON CUSTOMIZÁVEL
// ===================================

interface CustomSkeletonProps {
  template: 'card' | 'list' | 'form' | 'table' | 'dashboard' | 'detail';
  count?: number;
  showActions?: boolean;
  showHeader?: boolean;
  className?: string;
}