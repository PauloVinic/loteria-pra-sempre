'use client'

import { useFormState, useFormStatus } from 'react-dom'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AuthActionState } from '@/lib/auth/types'
import { AUTH_ACTION_INITIAL_STATE } from '@/lib/auth/types'
import { login, signup } from './actions'

type AuthFormProps = {
  state: AuthActionState
  formAction: (formData: FormData) => void
}

function FormStatusMessage({ state }: { state: AuthActionState }) {
  if (state.status !== 'error' || !state.message) {
    return null
  }

  return (
    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium">
      {state.message}
    </div>
  )
}

function LoginForm({ state, formAction }: AuthFormProps) {
  return (
    <form action={formAction} className="space-y-4">
      <LoginFields state={state} />
      <FormStatusMessage state={state} />
      <SubmitButton pendingLabel="Entrando..." idleLabel="Entrar" />
    </form>
  )
}

function SignupForm({ state, formAction }: AuthFormProps) {
  return (
    <form action={formAction} className="space-y-4">
      <SignupFields state={state} />
      <FormStatusMessage state={state} />
      <SubmitButton pendingLabel="Criando conta..." idleLabel="Criar Conta" />
    </form>
  )
}

function LoginFields({ state }: { state: AuthActionState }) {
  const { pending } = useFormStatus()

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          autoComplete="email"
          disabled={pending}
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          placeholder="********"
          required
          autoComplete="current-password"
          disabled={pending}
        />
        {state.fieldErrors?.password && (
          <p className="text-sm text-destructive">{state.fieldErrors.password}</p>
        )}
      </div>
    </>
  )
}

function SignupFields({ state }: { state: AuthActionState }) {
  const { pending } = useFormStatus()

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="signup-name">Nome Completo</Label>
        <Input
          id="signup-name"
          name="fullName"
          type="text"
          placeholder="Seu nome completo"
          required
          autoComplete="name"
          disabled={pending}
        />
        {state.fieldErrors?.fullName && (
          <p className="text-sm text-destructive">{state.fieldErrors.fullName}</p>
        )}
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
          disabled={pending}
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Senha</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          placeholder="********"
          required
          autoComplete="new-password"
          minLength={6}
          disabled={pending}
        />
        <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
        {state.fieldErrors?.password && (
          <p className="text-sm text-destructive">{state.fieldErrors.password}</p>
        )}
      </div>
    </>
  )
}

function SubmitButton({ pendingLabel, idleLabel }: { pendingLabel: string; idleLabel: string }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        idleLabel
      )}
    </Button>
  )
}

export default function LoginPage() {
  const [loginState, loginAction] = useFormState(login, AUTH_ACTION_INITIAL_STATE)
  const [signupState, signupAction] = useFormState(signup, AUTH_ACTION_INITIAL_STATE)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Loteria Pra Sempre</CardTitle>
          <CardDescription>Entre ou crie sua conta para começar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm state={loginState} formAction={loginAction} />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm state={signupState} formAction={signupAction} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
