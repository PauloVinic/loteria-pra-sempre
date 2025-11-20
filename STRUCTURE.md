# Estrutura do Projeto

Este documento descreve a organização da estrutura de pastas do projeto, seguindo as melhores práticas para aplicações Next.js de grande escala.

## 📁 Estrutura de Diretórios

```
my-nextjs-app/
├── app/                          # App Router (Next.js 14)
│   ├── layout.tsx               # Layout raiz da aplicação
│   ├── page.tsx                 # Página inicial
│   ├── globals.css              # Estilos globais e variáveis CSS
│   ├── (auth)/                  # Route groups para autenticação
│   │   ├── login/
│   │   └── register/
│   └── (dashboard)/             # Route groups para dashboard
│       └── dashboard/
│
├── components/                   # Componentes reutilizáveis
│   ├── ui/                      # Componentes Shadcn/UI
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/                  # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── common/                  # Componentes comuns
│       ├── Loading.tsx
│       └── ErrorBoundary.tsx
│
├── features/                     # Features organizadas por domínio
│   ├── auth/                    # Feature de autenticação
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types.ts
│   ├── dashboard/               # Feature de dashboard
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   └── ...
│
├── lib/                          # Utilitários e configurações
│   ├── supabase/                # Clientes Supabase
│   │   ├── client.ts            # Cliente para Client Components
│   │   ├── server.ts            # Cliente para Server Components
│   │   ├── middleware.ts        # Cliente para Middleware
│   │   └── types.ts             # Tipos TypeScript do Supabase
│   ├── utils.ts                 # Funções utilitárias
│   └── constants.ts             # Constantes da aplicação
│
├── hooks/                        # Custom React Hooks
│   ├── useAuth.ts
│   ├── useSupabase.ts
│   └── ...
│
├── types/                        # Definições de tipos TypeScript
│   ├── index.ts                 # Tipos globais
│   └── database.ts              # Tipos do banco de dados
│
├── public/                       # Arquivos estáticos
│   ├── images/
│   ├── icons/
│   └── ...
│
├── middleware.ts                 # Middleware do Next.js
├── next.config.js                # Configuração do Next.js
├── tailwind.config.ts            # Configuração do Tailwind
├── tsconfig.json                 # Configuração do TypeScript
├── components.json               # Configuração do Shadcn/UI
└── package.json                  # Dependências do projeto
```

## 🎯 Princípios de Organização

### 1. App Router
- Use o diretório `app/` para rotas e layouts
- Route groups `(group)` para organizar rotas sem afetar URLs
- Server Components por padrão, Client Components quando necessário

### 2. Features por Domínio
- Organize código por feature/domínio em `features/`
- Cada feature é auto-contida com seus próprios componentes, hooks e lógica
- Facilita escalabilidade e manutenção

### 3. Componentes Reutilizáveis
- `components/ui/`: Componentes do Shadcn/UI
- `components/layout/`: Componentes de layout
- `components/common/`: Componentes comuns compartilhados

### 4. Separação de Responsabilidades
- `lib/`: Lógica de negócio e utilitários
- `hooks/`: Custom hooks reutilizáveis
- `types/`: Definições de tipos compartilhados

## 📝 Convenções de Nomenclatura

- **Componentes**: PascalCase (ex: `UserProfile.tsx`)
- **Hooks**: camelCase com prefixo `use` (ex: `useAuth.ts`)
- **Utilitários**: camelCase (ex: `formatDate.ts`)
- **Tipos/Interfaces**: PascalCase (ex: `User.ts`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `API_BASE_URL`)

## 🚀 Adicionando Novas Features

1. Crie uma nova pasta em `features/` com o nome da feature
2. Organize internamente:
   ```
   features/nova-feature/
   ├── components/      # Componentes específicos da feature
   ├── hooks/          # Hooks específicos
   ├── lib/            # Lógica de negócio
   └── types.ts        # Tipos específicos
   ```
3. Use barrel exports (`index.ts`) para facilitar imports

## 🔄 Imports

Use path aliases configurados no `tsconfig.json`:

```typescript
// ✅ Bom
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

// ❌ Evite
import { Button } from '../../../components/ui/button'
```

