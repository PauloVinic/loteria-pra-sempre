'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export async function logout() {
  const supabase = await createServerClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Erro ao fazer logout:', error)
    return { error: error.message }
  }
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

