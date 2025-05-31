# Sistema de Gestão de Saúde - Frontend

Frontend em Next.js 14 para o Sistema de Gestão de Saúde, integrado com API multi-tenant.

## 🚀 Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- Login integrado com API
- Proteção de rotas
- Gerenciamento de sessão
- Logout automático em caso de erro

### ✅ Multi-tenant
- Detecção automática de tenant via subdomain
- Configurações personalizáveis por tenant
- Temas customizáveis

### ✅ Controle de Permissões
- Menu dinâmico baseado em permissões
- Diferentes papéis de usuário
- Proteção de funcionalidades

### ✅ Interface Responsiva
- Design minimalista e moderno
- Tema dark/light
- Componentes reutilizáveis

## 🛠️ Tecnologias

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**
- **Context API** (Gerenciamento de Estado)

## 📦 Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre no diretório
cd sistema-saude-frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute o projeto
npm run dev
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```bash
# URL da API Backend
NEXT_PUBLIC_API_URL=http://localhost:3000

# Tenant padrão para desenvolvimento
NEXT_PUBLIC_DEFAULT_TENANT=demo
```

### Configuração da API

O frontend espera que a API esteja rodando e disponível na URL configurada. Certifique-se de que:

1. A API está rodando na porta/URL configurada
2. Os endpoints necessários estão funcionando:
   - `POST /api/usuarios/login`
   - `GET /api/usuarios/perfil`
   - `GET /api/tenants/configuracoes/:subdomain`
   - `POST /api/usuarios/setup` (para primeiro usuário)

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # Páginas (App Router)
│   ├── dashboard/         # Área protegida
│   ├── login/            # Autenticação
│   └── layout.tsx        # Layout principal
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base
│   ├── layout/          # Layout principal
│   └── providers/       # Providers React
├── contexts/            # Contexts do React
│   └── AuthContext.tsx  # Context de autenticação
├── lib/                # Utilitários
│   └── api.ts          # Serviços de API
└── middleware.ts       # Middleware do Next.js
```

## 🔐 Sistema de Autenticação

### Fluxo de Login

1. Usuário acessa `/login`
2. Sistema detecta tenant via subdomain
3. Carrega configurações do tenant
4. Usuário insere credenciais
5. Sistema valida via API
6. Token é armazenado no localStorage
7. Redirecionamento para dashboard

### Proteção de Rotas

- Middleware do Next.js protege rotas `/dashboard`
- Context de autenticação gerencia estado
- Redirecionamento automático para login se não autenticado

### Permissões e Papéis

O sistema suporta diferentes papéis:
- **ADMIN**: Acesso total
- **MEDICO**: Consultas e prescrições
- **ENFERMEIRO**: Assistência e agendamentos
- **RECEPCIONISTA**: Agendamentos e cadastros
- **FARMACEUTICO**: Medicamentos e estoque
- **LABORATORISTA**: Exames e resultados
- **GESTOR**: Relatórios e gestão

## 🎨 Temas e Personalização

### Temas por Tenant

Cada tenant pode ter:
- Logo personalizado
- Cores primárias e secundárias
- Configurações específicas

### Sistema de Cores

O sistema usa CSS Variables para permitir personalização:
- `--primary`: Cor primária
- `--secondary`: Cor secundária
- `--accent`: Cor de destaque

## 🔧 Desenvolvimento

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm run start

# Lint
npm run lint
```

### Adicionando Novas Páginas

1. Crie a página em `src/app/dashboard/[nova-pagina]/page.tsx`
2. Adicione item no menu em `src/components/layout/Sidebar.tsx`
3. Configure permissões necessárias
4. Teste funcionalidade

### Adicionando Novas Permissões

1. Adicione a permissão no array `menuItems` do Sidebar
2. Configure na API backend
3. Teste com diferentes papéis de usuário

## 🌐 Deploy

### Variáveis de Produção

```bash
NEXT_PUBLIC_API_URL=https://api.seudominio.com
```

### Configuração de Subdomains

Para suporte completo a multi-tenant:

1. Configure DNS para `*.seudominio.com`
2. Configure SSL wildcard
3. Ajuste configurações do servidor

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de CORS**
- Verifique configuração da API
- Certifique-se que headers estão corretos

**Tenant não encontrado**
- Verifique se tenant existe na API
- Confirme configuração de subdomain

**Token inválido**
- Limpe localStorage: `localStorage.clear()`
- Faça login novamente

## 📝 TODO

- [ ] Implementar páginas de pacientes
- [ ] Sistema de notificações
- [ ] Relatórios interativos
- [ ] Gestão de medicamentos
- [ ] Agendamento de consultas
- [ ] Histórico médico
- [ ] Integração com laboratórios

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.