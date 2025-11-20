# Loteria Pra Sempre

Aplicação de loteria perpétua desenvolvida com Next.js 14, TypeScript, Supabase e Shadcn/UI.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Shadcn/UI** - Componentes UI acessíveis
- **Supabase** - Backend as a Service (PostgreSQL + Auth)
- **PostgreSQL** - Banco de dados relacional

## 📁 Estrutura de Pastas

```
my-nextjs-app/
├── app/                    # App Router (Next.js 14)
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Página inicial
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes Shadcn/UI
│   └── ...               # Outros componentes
├── features/             # Features organizadas por domínio
│   └── ...               # Cada feature com seus componentes, hooks, etc
├── lib/                  # Utilitários e configurações
│   ├── supabase/         # Clientes Supabase
│   └── utils.ts          # Funções utilitárias
├── hooks/                # Custom React Hooks
├── types/                # Definições de tipos TypeScript
├── public/               # Arquivos estáticos
└── ...                   # Arquivos de configuração
```

## 🛠️ Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

3. Preencha as variáveis no arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Execute o schema SQL no Supabase:
   - Acesse o SQL Editor no Supabase
   - Execute o arquivo `supabase/schema.sql`

## 🚦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run type-check` - Verifica tipos TypeScript

## 📦 Adicionando Componentes Shadcn/UI

Para adicionar novos componentes do Shadcn/UI:

```bash
npx shadcn-ui@latest add [component-name]
```

## 🔐 Configuração Supabase

O projeto está configurado com três clientes Supabase:

1. **Client** (`lib/supabase/client.ts`) - Para uso no cliente
2. **Server** (`lib/supabase/server.ts`) - Para uso em Server Components e Middleware Helpers
3. **Middleware** (`middleware.ts`) - Para autenticação em rotas

## ✨ Funcionalidades

- ✅ Autenticação completa (Login/Signup)
- ✅ Dashboard protegido com RLS
- ✅ Sistema de carteira (wallets)
- ✅ Bilhetes perpétuos
- ✅ Sorteios mensais
- ✅ Histórico de transações
- ✅ Middleware de proteção de rotas

## 📝 Estrutura do Banco de Dados

O projeto inclui um schema SQL completo (`supabase/schema.sql`) com:
- Tabelas: profiles, wallets, tickets, draws, transactions
- Row Level Security (RLS) configurado
- Triggers automáticos para criação de perfil e carteira
- Funções de servidor para operações seguras

## 🤝 Contribuindo

Este é um projeto template. Sinta-se livre para adaptar conforme suas necessidades.

