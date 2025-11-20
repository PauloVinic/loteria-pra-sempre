# Configuracao Supabase

Este diretorio contem os clientes Supabase configurados para diferentes contextos.

## Clientes Disponiveis

### 1. Client (`client.ts`)
Para uso em componentes do cliente (Client Components).

```tsx
'use client'
import { useMemo } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const handleClick = async () => {
    const { data, error } = await supabase.from('table').select('*')
  }
}
```

### 2. Server (`server.ts`)
Para uso em Server Components e Server Actions.

```tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createServerClient()
  const { data } = await supabase.from('table').select('*')
  
  return <div>{/* ... */}</div>
}
```

### 3. Middleware (`middleware.ts`)
Para autenticacao e protecao de rotas no middleware.

O middleware esta configurado para redirecionar usuarios nao autenticados para `/login` e utiliza `createMiddlewareClient` definido em `lib/supabase/server.ts`.

## Variaveis de Ambiente

Certifique-se de configurar as seguintes variaveis no arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

## Gerando Tipos TypeScript

Para gerar tipos TypeScript a partir do seu schema do Supabase:

```bash
npx supabase gen types typescript --project-id your-project-id > lib/supabase/types.ts
```

Ou use a CLI do Supabase:

```bash
supabase gen types typescript --project-id your-project-id > lib/supabase/types.ts
```

