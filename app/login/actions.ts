'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

export type ActionResult = {
  error?: string
  success?: boolean
  message?: string
  redirectTo?: string
}

export async function login(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('Tentando login com:', { email, password: password ? '***' : 'vazio' })

  if (!email || !password) {
    console.log('Erro: Email ou senha vazios')
    return {
      error: 'Email e senha são obrigatórios',
    }
  }

  try {
    const supabase = await createServerClient()
    console.log('Cliente Supabase criado, tentando autenticar...')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Erro do Supabase:', error)
      return {
        error: error.message || 'Erro ao fazer login',
      }
    }

    if (!data.user) {
      console.error('Erro: data.user é null')
      return {
        error: 'Erro ao autenticar usuário',
      }
    }

    console.log('Login bem-sucedido para:', data.user.email)
    revalidatePath('/', 'layout')
    return {
      success: true,
      message: 'Login realizado com sucesso',
      redirectTo: '/dashboard',
    }
  } catch (error) {
    console.error('Erro inesperado no login:', error)
    return {
      error: error instanceof Error ? error.message : 'Erro inesperado ao fazer login',
    }
  }
}

export async function signup(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  console.log('Tentando signup com:', { 
    email, 
    password: password ? '***' : 'vazio',
    fullName 
  })

  if (!email || !password) {
    console.log('Erro: Email ou senha vazios')
    return {
      error: 'Email e senha são obrigatórios',
    }
  }

  if (password.length < 6) {
    console.log('Erro: Senha muito curta')
    return {
      error: 'A senha deve ter pelo menos 6 caracteres',
    }
  }

  try {
    const supabase = await createServerClient()
    console.log('Cliente Supabase criado, tentando criar usuário...')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`,
      },
    })

    if (error) {
      console.error('Erro do Supabase no signup:', error)
      return {
        error: error.message || 'Erro ao criar conta',
      }
    }

    if (!data.user) {
      console.error('Erro: data.user é null no signup')
      return {
        error: 'Erro ao criar usuário',
      }
    }

    console.log('Signup bem-sucedido para:', data.user.email)

    // Verifica se a confirmação de email está habilitada
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session após signup:', session ? 'existe' : 'não existe')

    revalidatePath('/', 'layout')

    if (session) {
      // Usuário já está autenticado (confirmação de email desligada)
      console.log('Redirecionando para /dashboard')
      return {
        success: true,
        message: 'Conta criada com sucesso',
        redirectTo: '/dashboard',
      }
    } else {
      // Confirmação de email ligada - redireciona para home com mensagem
      console.log('Redirecionando para / (confirmação de email necessária)')
      return {
        success: true,
        message: 'Verifique seu email para confirmar sua conta',
        redirectTo: '/',
      }
    }
  } catch (error) {
    console.error('Erro inesperado no signup:', error)
    return {
      error: error instanceof Error ? error.message : 'Erro inesperado ao criar conta',
    }
  }
}
