'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export async function logout(_formData?: FormData): Promise<void> {
  const supabase = await createServerClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Erro ao fazer logout:', error)
    // Em caso de erro, ainda redireciona para login
  }
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

