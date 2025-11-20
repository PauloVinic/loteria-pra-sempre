import type { AuthError } from '@supabase/supabase-js'
import type { AuthActionState, AuthFieldErrors } from './types'

type ParseOptions = {
  requireFullName?: boolean
}

export function parseAuthFormData(formData: FormData, options: ParseOptions = {}) {
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null)?.trim() ?? ''
  const fullName = (formData.get('fullName') as string | null)?.trim()

  const fieldErrors: AuthFieldErrors = {}

  if (!email || !email.includes('@')) {
    fieldErrors.email = 'Informe um email válido.'
  }

  if (!password) {
    fieldErrors.password = 'Informe sua senha.'
  }

  if (options.requireFullName && !fullName) {
    fieldErrors.fullName = 'Informe seu nome completo.'
  }

  if (options.requireFullName && password && password.length < 6) {
    fieldErrors.password = 'A senha deve ter pelo menos 6 caracteres.'
  }

  return {
    email,
    password,
    fullName,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  }
}

export function buildFieldErrorState(fieldErrors: AuthFieldErrors): AuthActionState {
  return {
    status: 'error',
    message: 'Revise os campos destacados e tente novamente.',
    fieldErrors,
  }
}

export function mapSupabaseAuthError(error: AuthError): AuthActionState {
  const normalizedMessage = error.message?.toLowerCase() ?? ''

  if (normalizedMessage.includes('invalid login credentials')) {
    return {
      status: 'error',
      message: 'Email ou senha inválidos.',
    }
  }

  if (normalizedMessage.includes('email rate limit exceeded')) {
    return {
      status: 'error',
      message: 'Limite de tentativas atingido. Aguarde alguns minutos.',
    }
  }

  return {
    status: 'error',
    message: 'Não foi possível concluir a autenticação. Tente novamente.',
  }
}
