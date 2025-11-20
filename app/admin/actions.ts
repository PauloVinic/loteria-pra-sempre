'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/is-admin'

export async function runDraw(_prevState: any, formData: FormData) {
  try {
    const rawAmount = formData.get('amount')
    const rawType = formData.get('drawType')

    const prizeAmount = Number(rawAmount)
    const drawType = typeof rawType === 'string' && rawType.trim() ? rawType.trim() : 'manual'

    if (!Number.isFinite(prizeAmount) || prizeAmount <= 0) {
      return {
        status: 'error',
        message: 'Informe um valor de premio valido.',
      }
    }

    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user?.email || !isAdmin(user.email)) {
      return {
        status: 'error',
        message: 'Acesso nao autorizado para executar sorteio.',
      }
    }

    const { data, error } = await supabase.rpc('perform_draw', {
      p_prize_amount: prizeAmount,
      p_draw_type: drawType,
    })

    if (error) {
      console.error('[Draw] Erro ao executar perform_draw', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return {
        status: 'error',
        message: 'Nao foi possivel executar o sorteio. Tente novamente.',
      }
    }

    console.log('[Draw] Sorteio executado com sucesso', data)

    revalidatePath('/admin')
    revalidatePath('/dashboard')

    return {
      status: 'success',
      message: 'Sorteio executado com sucesso.',
    }
  } catch (err) {
    console.error('[Draw] Erro inesperado ao executar sorteio', err)
    return {
      status: 'error',
      message: 'Ocorreu um erro inesperado ao executar o sorteio.',
    }
  }
}
