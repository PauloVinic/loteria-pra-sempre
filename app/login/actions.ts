'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { buildFieldErrorState, mapSupabaseAuthError, parseAuthFormData } from '@/lib/auth/helpers'
import type { AuthActionState } from '@/lib/auth/types'
import { createServerClient } from '@/lib/supabase/server'

// TODO: Nao existe app/signup/page.tsx; o fluxo de cadastro permanece integrado em /login.

export async function login(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const { email, password, fieldErrors } = parseAuthFormData(formData)

  if (fieldErrors) {
    return buildFieldErrorState(fieldErrors)
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return mapSupabaseAuthError(error)
  }

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function signup(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const { email, password, fullName, fieldErrors } = parseAuthFormData(formData, {
    requireFullName: true,
  })

  if (fieldErrors) {
    return buildFieldErrorState(fieldErrors)
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return mapSupabaseAuthError(error)
  }

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
