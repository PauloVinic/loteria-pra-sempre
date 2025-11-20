'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TICKET_PRICE } from './constants'
import type { PurchaseActionState } from './purchase-state'

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

export async function purchaseTickets(
  _prevState: PurchaseActionState,
  formData: FormData,
): Promise<PurchaseActionState> {
  const quantityRaw = (formData.get('quantity') as string | null)?.trim() ?? ''
  const quantity = Number.parseInt(quantityRaw, 10)

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      status: 'error',
      code: 'INVALID_INPUT',
      message: 'Informe uma quantidade valida de bilhetes.',
      fieldErrors: {
        quantity: 'Quantidade deve ser um numero inteiro maior que zero.',
      },
    }
  }

  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('[Purchase] Erro ao obter sessao ou usuario.', authError)
    return {
      status: 'error',
      code: 'SESSION_NOT_FOUND',
      message: 'Sessao nao encontrada. Faca login novamente.',
    }
  }

  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('user_id', user.id)
    .maybeSingle()

  if (walletError) {
    console.error('[Purchase] Erro ao buscar carteira.', walletError)
    return {
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'Nao foi possivel validar seu saldo. Tente novamente.',
    }
  }

  if (!wallet) {
    console.error('[Purchase] Carteira nao encontrada para usuario.')
    return {
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'Carteira nao encontrada. Tente sair e entrar novamente.',
    }
  }

  const currentBalance = Number(wallet.balance ?? 0)
  const totalCost = quantity * TICKET_PRICE

  if (currentBalance < totalCost) {
    return {
      status: 'error',
      code: 'INSUFFICIENT_FUNDS',
      message: 'Saldo insuficiente para comprar essa quantidade de bilhetes.',
      fieldErrors: {
        quantity: 'Saldo insuficiente.',
      },
    }
  }

  const { error: purchaseError } = await supabase.rpc('perform_ticket_purchase', {
    p_user_id: user.id,
    p_quantity: quantity,
    p_ticket_price: TICKET_PRICE,
  })

  if (purchaseError) {
    const message = purchaseError.message?.toLowerCase() ?? ''
    console.error('[Purchase] Erro na perform_ticket_purchase.', {
      code: purchaseError.code,
      message: purchaseError.message,
      details: purchaseError.details,
      hint: purchaseError.hint,
    })

    if (message.includes('saldo insuficiente')) {
      return {
        status: 'error',
        code: 'INSUFFICIENT_FUNDS',
        message: 'Saldo insuficiente para comprar essa quantidade de bilhetes.',
        fieldErrors: {
          quantity: 'Saldo insuficiente.',
        },
      }
    }

    return {
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'Nao foi possivel registrar a transacao. Tente novamente.',
    }
  }

  revalidatePath('/dashboard')

  return {
    status: 'success',
    message: 'Bilhetes comprados com sucesso!',
  }
}
