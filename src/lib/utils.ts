// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===================================
// FORMATAÇÃO DE DOCUMENTOS
// ===================================

export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatRG = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 9) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  }
  return numbers;
};

export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// ===================================
// FORMATAÇÃO DE DATAS
// ===================================

export const formatDate = (dateString: string, format: 'short' | 'long' | 'datetime' = 'short'): string => {
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('pt-BR');
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  if (format === 'datetime') {
    return date.toLocaleString('pt-BR');
  }
  
  return date.toLocaleDateString('pt-BR');
};

export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
};

export const formatDateTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Agora mesmo';
  if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
  if (diffInHours < 24) return `${diffInHours}h atrás`;
  if (diffInDays < 7) return `${diffInDays} dias atrás`;
  
  return formatDate(dateString);
};

// ===================================
// VALIDAÇÕES
// ===================================

export const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;

  return true;
};

export const validateCNPJ = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  if (/^(\d)\1+$/.test(numbers)) return false;

  let sum = 0;
  let weight = 2;
  
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers[12]) !== digit1) return false;

  sum = 0;
  weight = 2;
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(numbers[13]) === digit2;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length >= 10 && numbers.length <= 11;
};

// ===================================
// UTILITÁRIOS DE TEXTO
// ===================================

export const getSexoDisplay = (sexo: string): string => {
  const map = { 
    'M': 'Masculino', 
    'F': 'Feminino', 
    'O': 'Outro' 
  };
  return map[sexo as keyof typeof map] || sexo;
};

export const getPapelDisplay = (papel: string): string => {
  const map = {
    'ADMIN': 'Administrador',
    'MEDICO': 'Médico',
    'ENFERMEIRO': 'Enfermeiro',
    'RECEPCIONISTA': 'Recepcionista',
    'FARMACEUTICO': 'Farmacêutico',
    'LABORATORISTA': 'Laboratorista',
    'GESTOR': 'Gestor'
  };
  return map[papel as keyof typeof map] || papel;
};

export const getStatusDisplay = (status: string): string => {
  const map = {
    'ATIVO': 'Ativo',
    'INATIVO': 'Inativo',
    'PENDENTE': 'Pendente',
    'BLOQUEADO': 'Bloqueado',
    'SUSPENSO': 'Suspenso'
  };
  return map[status as keyof typeof map] || status;
};

export const getTipoSanguineoDisplay = (tipo: string): string => {
  return tipo; // A+, B-, O+, etc.
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ===================================
// CÁLCULOS DE IDADE E TEMPO
// ===================================

export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const getAgeDisplay = (birthDate: string): string => {
  const age = calculateAge(birthDate);
  if (age === 0) {
    const today = new Date();
    const birth = new Date(birthDate);
    const months = today.getMonth() - birth.getMonth();
    if (months === 0) {
      const days = today.getDate() - birth.getDate();
      return `${days} dias`;
    }
    return `${months} meses`;
  }
  return `${age} anos`;
};

export const isMinor = (birthDate: string): boolean => {
  return calculateAge(birthDate) < 18;
};

export const isElderly = (birthDate: string): boolean => {
  return calculateAge(birthDate) >= 60;
};

// ===================================
// FORMATAÇÃO DE VALORES
// ===================================

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

// ===================================
// UTILITÁRIOS DE BUSCA E FILTROS
// ===================================

export const normalizeSearchTerm = (term: string): string => {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
};

export const searchInText = (text: string, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  
  const normalizedText = normalizeSearchTerm(text);
  const normalizedSearch = normalizeSearchTerm(searchTerm);
  
  return normalizedText.includes(normalizedSearch);
};

export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// ===================================
// UTILITÁRIOS DE URL E NAVEGAÇÃO
// ===================================

export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  return searchParams.toString();
};

export const parseQueryString = (queryString: string): Record<string, string> => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
};

// ===================================
// UTILITÁRIOS DE ARQUIVO E DOWNLOAD
// ===================================

export const downloadFile = (content: string, filename: string, contentType: string = 'text/plain'): void => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadJSON = (data: any, filename: string): void => {
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, filename, 'application/json');
};

export const downloadCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  downloadFile(csvContent, filename, 'text/csv');
};

// ===================================
// UTILITÁRIOS DE VALIDAÇÃO DE FORMULÁRIO
// ===================================

export const validateRequired = (value: any): string | null => {
  if (value === null || value === undefined || value === '') {
    return 'Este campo é obrigatório';
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number): string | null => {
  if (value && value.length < minLength) {
    return `Deve ter pelo menos ${minLength} caracteres`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number): string | null => {
  if (value && value.length > maxLength) {
    return `Deve ter no máximo ${maxLength} caracteres`;
  }
  return null;
};

export const validateMinAge = (birthDate: string, minAge: number): string | null => {
  const age = calculateAge(birthDate);
  if (age < minAge) {
    return `Idade mínima é ${minAge} anos`;
  }
  return null;
};

export const validateMaxAge = (birthDate: string, maxAge: number): string | null => {
  const age = calculateAge(birthDate);
  if (age > maxAge) {
    return `Idade máxima é ${maxAge} anos`;
  }
  return null;
};

// ===================================
// UTILITÁRIOS DE ERRO
// ===================================

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'Erro desconhecido';
};

export const isNetworkError = (error: any): boolean => {
  return error?.code === 'NETWORK_ERROR' || 
         error?.message?.includes('network') ||
         error?.message?.includes('fetch');
};

// ===================================
// UTILITÁRIOS DE LOCAL STORAGE
// ===================================

export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Erro ao salvar no localStorage:', error);
  }
};

export const getLocalStorage = (key: string, defaultValue: any = null): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Erro ao ler do localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Erro ao remover do localStorage:', error);
  }
};

// ===================================
// UTILITÁRIOS DE DEBOUNCE
// ===================================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ===================================
// UTILITÁRIOS DE ARRAY
// ===================================

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// ===================================
// UTILITÁRIOS DE CORES PARA STATUS
// ===================================

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'ATIVO': 'green',
    'INATIVO': 'red',
    'PENDENTE': 'yellow',
    'BLOQUEADO': 'orange',
    'SUSPENSO': 'purple',
    'APROVADO': 'green',
    'REJEITADO': 'red',
    'EM_ANALISE': 'blue',
    'CANCELADO': 'gray'
  };
  
  return colors[status] || 'gray';
};

export const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    'ADMIN': 'blue',
    'MEDICO': 'green',
    'ENFERMEIRO': 'purple',
    'RECEPCIONISTA': 'orange',
    'FARMACEUTICO': 'cyan',
    'LABORATORISTA': 'pink',
    'GESTOR': 'indigo'
  };
  
  return colors[role] || 'gray';
};

// ===================================
// UTILITÁRIOS DE VALIDAÇÃO MÉDICA
// ===================================

export const validateCRM = (crm: string, estado: string): boolean => {
  const numbers = crm.replace(/\D/g, '');
  return numbers.length >= 4 && numbers.length <= 6 && estado.length === 2;
};

export const validateCartaoSUS = (cartao: string): boolean => {
  const numbers = cartao.replace(/\D/g, '');
  return numbers.length === 15;
};

export const validateCNES = (cnes: string): boolean => {
  const numbers = cnes.replace(/\D/g, '');
  return numbers.length === 7;
};

// ===================================
// UTILITÁRIOS DE FORMATAÇÃO MÉDICA
// ===================================

export const formatCRM = (crm: string, estado: string): string => {
  return `${crm}/${estado}`;
};

export const formatCartaoSUS = (cartao: string): string => {
  const numbers = cartao.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
};

export const formatCNES = (cnes: string): string => {
  return cnes.replace(/\D/g, '');
};

// ===================================
// UTILITÁRIOS DE HORÁRIO MÉDICO
// ===================================

export const formatHorario = (hora: string): string => {
  return hora.substring(0, 5); // Remove segundos se houver
};

export const isHorarioValido = (horaInicio: string, horaFim: string): boolean => {
  const inicio = new Date(`1970-01-01T${horaInicio}:00`);
  const fim = new Date(`1970-01-01T${horaFim}:00`);
  return inicio < fim;
};

export const calcularDuracaoConsulta = (horaInicio: string, horaFim: string): number => {
  const inicio = new Date(`1970-01-01T${horaInicio}:00`);
  const fim = new Date(`1970-01-01T${horaFim}:00`);
  return (fim.getTime() - inicio.getTime()) / (1000 * 60); // Retorna em minutos
};

export const gerarHorariosDisponiveis = (
  horaInicio: string, 
  horaFim: string, 
  duracaoConsulta: number = 30
): string[] => {
  const horarios: string[] = [];
  const inicio = new Date(`1970-01-01T${horaInicio}:00`);
  const fim = new Date(`1970-01-01T${horaFim}:00`);
  
  let atual = new Date(inicio);
  
  while (atual < fim) {
    horarios.push(atual.toTimeString().substring(0, 5));
    atual.setMinutes(atual.getMinutes() + duracaoConsulta);
  }
  
  return horarios;
};

// ===================================
// UTILITÁRIOS DE PAGINAÇÃO
// ===================================

export const calculatePagination = (
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] => {
  const pages: number[] = [];
  
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
};

export const getPaginationInfo = (
  page: number,
  limit: number,
  total: number
): {
  startItem: number;
  endItem: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} => {
  const totalPages = Math.ceil(total / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  
  return {
    startItem,
    endItem,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

// ===================================
// UTILITÁRIOS DE TOAST/NOTIFICAÇÃO
// ===================================

export const createToastMessage = (
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message?: string
): { type: string; title: string; message?: string; duration?: number } => {
  const durations = {
    success: 3000,
    error: 5000,
    warning: 4000,
    info: 3000
  };
  
  return {
    type,
    title,
    message,
    duration: durations[type]
  };
};

// ===================================
// UTILITÁRIOS DE GEOLOCALIZAÇÃO
// ===================================

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ===================================
// UTILITÁRIOS DE IMPRESSÃO
// ===================================

export const printElement = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Impressão</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
  printWindow.close();
};

// ===================================
// UTILITÁRIOS DE TEMA/DARK MODE
// ===================================

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const applyTheme = (theme: 'light' | 'dark' | 'system'): void => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'system') {
    theme = getSystemTheme();
  }
  
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  
  setLocalStorage('theme', theme);
};

// ===================================
// UTILITÁRIOS DE PERFORMANCE
// ===================================

export const measurePerformance = (name: string, fn: () => any): any => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ===================================
// UTILITÁRIOS DE CLIPBOARD
// ===================================

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para browsers mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Erro ao copiar para clipboard:', error);
    return false;
  }
};

// ===================================
// UTILITÁRIOS DE MÁSCARAS DE INPUT
// ===================================

export const applyMask = (value: string, mask: string): string => {
  let maskedValue = '';
  let valueIndex = 0;
  
  for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
    if (mask[i] === '#') {
      if (/\d/.test(value[valueIndex])) {
        maskedValue += value[valueIndex];
        valueIndex++;
      } else {
        break;
      }
    } else {
      maskedValue += mask[i];
    }
  }
  
  return maskedValue;
};

export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

// ===================================
// UTILITÁRIOS DE MÍDIA/RESPONSIVIDADE
// ===================================

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

// ===================================
// UTILITÁRIOS DE ANIMAÇÃO
// ===================================

export const smoothScrollTo = (elementId: string, offset: number = 0): void => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const elementPosition = element.offsetTop - offset;
  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth'
  });
};

export const fadeIn = (element: HTMLElement, duration: number = 300): void => {
  element.style.opacity = '0';
  element.style.display = 'block';
  
  let start: number | null = null;
  
  const animate = (timestamp: number) => {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / duration;
    
    element.style.opacity = Math.min(progress, 1).toString();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};

export const fadeOut = (element: HTMLElement, duration: number = 300): void => {
  let start: number | null = null;
  const initialOpacity = parseFloat(getComputedStyle(element).opacity);
  
  const animate = (timestamp: number) => {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / duration;
    
    element.style.opacity = (initialOpacity * (1 - Math.min(progress, 1))).toString();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.style.display = 'none';
    }
  };
  
  requestAnimationFrame(animate);
};