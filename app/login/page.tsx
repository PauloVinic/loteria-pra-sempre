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
import { login, signup, type ActionResult } from './actions'

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    console.log('🔵 handleSubmit CHAMADO!')
    e.preventDefault()
    console.log('🔵 preventDefault executado')
    
    setError(null)
    setIsPending(true)
    console.log('🔵 Estado atualizado para pending')
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    console.log('🔵 Formulário de login submetido', { email, password: password ? '***' : 'vazio' })

    try {
      console.log('🔵 Chamando login action...')
      const result = await login(null, formData)
      console.log('🔵 Resultado do login COMPLETO:', JSON.stringify(result, null, 2))
      
      if (result?.error) {
        console.log('🔵 Erro retornado:', result.error)
        setError(result.error)
        alert(`Erro no login: ${result.error}`)
        setIsPending(false)
      } else if (result?.success) {
        console.log('🔵 Login bem-sucedido!')
        console.log('🔵 redirectTo:', result.redirectTo)
        const redirectPath = result.redirectTo || '/dashboard'
        console.log('🔵 Redirecionando para:', redirectPath)
        
        // Mostra alerta para confirmar
        alert(`Login realizado com sucesso! Redirecionando para ${redirectPath}`)
        
        // Força o redirecionamento de múltiplas formas
        setIsPending(false)
        
        // Método 1: window.location.href
        if (typeof window !== 'undefined') {
          console.log('🔵 Usando window.location.href')
          window.location.href = redirectPath
        }
        
        // Método 2: Fallback com setTimeout
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== redirectPath) {
            console.log('🔵 Fallback: redirecionando novamente')
            window.location.replace(redirectPath)
          }
        }, 500)
      } else {
        console.log('🔵 Resultado inesperado:', result)
        console.log('🔵 Tipo do resultado:', typeof result)
        alert(`Resposta inesperada do servidor: ${JSON.stringify(result)}`)
        setIsPending(false)
      }
    } catch (error) {
      console.error('🔴 Erro no handleSubmit do login:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(errorMessage)
      alert(`Erro ao processar login: ${errorMessage}`)
      setIsPending(false)
    }
  }

  function handleButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    console.log('🟢 Botão clicado!', e)
    // Não fazemos nada aqui, apenas logamos
    // O formulário deve ser submetido pelo onSubmit
  }
  
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    console.log('🟡 Form onSubmit disparado!', e)
    handleSubmit(e)
  }

  return (
    <form 
      onSubmit={(e) => {
        console.log('🟡 FORM onSubmit CAPTURADO DIRETAMENTE!', e)
        handleSubmit(e)
      }} 
      className="space-y-4"
      id="login-form"
    >
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
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isPending}
        onClick={(e) => {
          console.log('🟢 Botão onClick disparado!', e)
          handleButtonClick(e)
          // Não previne o default, deixa o form ser submetido
        }}
        onMouseDown={(e) => {
          console.log('🟢 Botão onMouseDown!', e)
        }}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  )
}

function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    console.log('🟡 handleSubmit SIGNUP CHAMADO!')
    e.preventDefault()
    setError(null)
    setIsPending(true)
    
    const formData = new FormData(e.currentTarget)
    console.log('🟡 Formulário de signup submetido')

    try {
      const result = await signup(null, formData)
      console.log('🟡 Resultado do signup:', result)
      
      if (result?.error) {
        setError(result.error)
        alert(`Erro no cadastro: ${result.error}`)
      } else if (result?.success) {
        console.log('🟡 Signup bem-sucedido, redirecionando para:', result.redirectTo || '/dashboard')
        const redirectPath = result.redirectTo || '/dashboard'
        // Usa window.location para garantir o redirecionamento
        window.location.href = redirectPath
      }
    } catch (error) {
      console.error('🟡 Erro no handleSubmit do signup:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(errorMessage)
      alert(`Erro ao processar cadastro: ${errorMessage}`)
    } finally {
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
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          'Criar Conta'
        )}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  console.log('🟣 LoginPage renderizado')
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md">
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
