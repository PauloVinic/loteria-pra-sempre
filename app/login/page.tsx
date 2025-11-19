'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { login, signup } from './actions'

// Componente de Formulário de Login
function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    
    const formData = new FormData(e.currentTarget)

    try {
      const result = await login(null, formData)
      
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
      } else {
        // Login bem-sucedido - o redirect será tratado pelo Next.js
        // Mas vamos forçar um refresh para garantir
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      // Redirects do Next.js lançam uma exceção especial
      // Se for um redirect, não é um erro real
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        // É um redirect, está tudo bem
        return
      }
      console.error('Erro no login:', err)
      setError('Erro inesperado ao fazer login')
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          autoComplete="email"
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          disabled={isPending}
        />
      </div>
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  )
}

// Componente de Formulário de Cadastro
function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    
    const formData = new FormData(e.currentTarget)

    try {
      const result = await signup(null, formData)
      
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
      }
    } catch (err) {
      console.error(err)
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Nome Completo</Label>
        <Input
          id="signup-name"
          name="fullName"
          type="text"
          placeholder="Seu nome completo"
          autoComplete="name"
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          autoComplete="email"
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Senha</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          minLength={6}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Mínimo de 6 caracteres
        </p>
      </div>
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar Conta'
        )}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">
            Loteria Pra Sempre
          </CardTitle>
          <CardDescription>
            Entre ou crie sua conta para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}