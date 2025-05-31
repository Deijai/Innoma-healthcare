// src/lib/demo-tenants.ts

export const demoTenants = [
  {
    id: 'ribeirao-preto',
    nome: 'Prefeitura Municipal de Ribeirão Preto',
    subdomain: 'ribeirao-preto',
    codigo: 'RP001',
    endereco: { cidade: 'Ribeirão Preto', estado: 'SP' },
    plano: { tipo: 'AVANCADO', status: 'ATIVO' },
    total_usuarios: 87,
    ultimo_acesso: new Date().toISOString(),
    is_popular: true,
    configuracoes: {
      cores_tema: {
        primaria: '#1e40af',
        secundaria: '#3b82f6',
        acento: '#f59e0b'
      },
      logo_url: null
    }
  },
  {
    id: 'sao-paulo',
    nome: 'Secretaria Municipal de Saúde - São Paulo',
    subdomain: 'sao-paulo',
    codigo: 'SP001',
    endereco: { cidade: 'São Paulo', estado: 'SP' },
    plano: { tipo: 'AVANCADO', status: 'ATIVO' },
    total_usuarios: 342,
    ultimo_acesso: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_popular: true,
    configuracoes: {
      cores_tema: {
        primaria: '#dc2626',
        secundaria: '#ef4444',
        acento: '#f97316'
      }
    }
  },
  {
    id: 'santos',
    nome: 'Prefeitura Municipal de Santos',
    subdomain: 'santos',
    codigo: 'STS001',
    endereco: { cidade: 'Santos', estado: 'SP' },
    plano: { tipo: 'INTERMEDIARIO', status: 'ATIVO' },
    total_usuarios: 54,
    ultimo_acesso: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    is_popular: true,
          configuracoes: {
      cores_tema: {
        primaria: '#059669',
        secundaria: '#10b981',
        acento: '#f59e0b'
      }
    }
  },
  {
    id: 'campinas',
    nome: 'Secretaria Municipal de Saúde - Campinas',
    subdomain: 'campinas',
    codigo: 'CP001',
    endereco: { cidade: 'Campinas', estado: 'SP' },
    plano: { tipo: 'INTERMEDIARIO', status: 'ATIVO' },
    total_usuarios: 76,
    ultimo_acesso: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_popular: false,
    configuracoes: {
      cores_tema: {
        primaria: '#7c3aed',
        secundaria: '#8b5cf6',
        acento: '#f59e0b'
      }
    }
  },
  {
    id: 'sorocaba',
    nome: 'Prefeitura Municipal de Sorocaba',
    subdomain: 'sorocaba',
    codigo: 'SRC001',
    endereco: { cidade: 'Sorocaba', estado: 'SP' },
    plano: { tipo: 'BASICO', status: 'ATIVO' },
    total_usuarios: 32,
    ultimo_acesso: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_popular: false,
    configuracoes: {
      cores_tema: {
        primaria: '#0891b2',
        secundaria: '#06b6d4',
        acento: '#f59e0b'
      }
    }
  },
  {
    id: 'guarulhos',
    nome: 'Secretaria de Saúde - Guarulhos',
    subdomain: 'guarulhos',
    codigo: 'GRU001',
    endereco: { cidade: 'Guarulhos', estado: 'SP' },
    plano: { tipo: 'INTERMEDIARIO', status: 'ATIVO' },
    total_usuarios: 45,
    ultimo_acesso: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    is_popular: false,
    configuracoes: {
      cores_tema: {
        primaria: '#be185d',
        secundaria: '#ec4899',
        acento: '#f59e0b'
      }
    }
  },
  {
    id: 'osasco',
    nome: 'Prefeitura de Osasco',
    subdomain: 'osasco',
    codigo: 'OSC001',
    endereco: { cidade: 'Osasco', estado: 'SP' },
    plano: { tipo: 'BASICO', status: 'ATIVO' },
    total_usuarios: 28,
    ultimo_acesso: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_popular: false,
    configuracoes: {
      cores_tema: {
        primaria: '#ea580c',
        secundaria: '#f97316',
        acento: '#f59e0b'
      }
    }
  },
  {
    id: 'demo',
    nome: 'Demo - Município Exemplo',
    subdomain: 'demo',
    codigo: 'DEMO',
    endereco: { cidade: 'Demo City', estado: 'DF' },
    plano: { tipo: 'BASICO', status: 'ATIVO' },
    total_usuarios: 12,
    ultimo_acesso: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    is_popular: false,
    configuracoes: {
      cores_tema: {
        primaria: '#374151',
        secundaria: '#6b7280',
        acento: '#f59e0b'
      }
    }
  }
];

// Dados de usuários demo por tenant
export const demoUsers = {
  'ribeirao-preto': [
    { usuario: 'admin', senha: '123456', papel: 'ADMIN', nome: 'Administrador RP' },
    { usuario: 'medico1', senha: '123456', papel: 'MEDICO', nome: 'Dr. João Silva' },
    { usuario: 'enfermeiro1', senha: '123456', papel: 'ENFERMEIRO', nome: 'Enf. Maria Santos' }
  ],
  'sao-paulo': [
    { usuario: 'admin', senha: '123456', papel: 'ADMIN', nome: 'Administrador SP' },
    { usuario: 'gestor1', senha: '123456', papel: 'GESTOR', nome: 'Gestor Municipal' }
  ],
  'santos': [
    { usuario: 'admin', senha: '123456', papel: 'ADMIN', nome: 'Administrador Santos' },
    { usuario: 'recep1', senha: '123456', papel: 'RECEPCIONISTA', nome: 'Recepcionista' }
  ],
  'demo': [
    { usuario: 'admin', senha: '123456', papel: 'ADMIN', nome: 'Admin Demo' },
    { usuario: 'demo', senha: 'demo', papel: 'MEDICO', nome: 'Usuário Demo' },
    { usuario: 'teste', senha: 'teste', papel: 'ENFERMEIRO', nome: 'Usuário Teste' }
  ]
};