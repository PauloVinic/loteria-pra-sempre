import { NextResponse } from 'next/server'
import { handleError, requireUser } from '@/lib/api/supabase-rpc'

const ALLOWED_TYPES = ['P10', 'P50', 'P100'] as const

type TicketType = (typeof ALLOWED_TYPES)[number]
type PurchaseItem = { ticket_type: TicketType; quantity: number }

type RequestBody = {
  items: PurchaseItem[]
  source: 'external' | 'wallet'
}

function parseBody(json: RequestBody) {
  const { items, source } = json ?? ({} as RequestBody)

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items é obrigatório e deve ser um array.')
  }

  const parsedItems: PurchaseItem[] = items.map((item) => {
    const ticket_type = item?.ticket_type as TicketType
    const quantity = Number(item?.quantity)

    if (!ALLOWED_TYPES.includes(ticket_type)) {
      throw new Error('ticket_type inválido. Use P10, P50 ou P100.')
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('quantity deve ser inteiro > 0.')
    }

    return { ticket_type, quantity }
  })

  const normalizedSource =
    source === 'external'
      ? 'PASS_PURCHASE_EXTERNAL'
      : source === 'wallet'
      ? 'PASS_PURCHASE_FROM_WALLET'
      : null

  if (!normalizedSource) {
    throw new Error('source deve ser "external" ou "wallet".')
  }

  return { parsedItems, normalizedSource }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody
    const { parsedItems, normalizedSource } = parseBody(body)

    const { supabase, user } = await requireUser()

    // Busca valores oficiais dos passes para calcular o total de forma segura
    const { data: ticketValues, error: ticketValueError } = await supabase
      .from('ticket_types')
      .select('id, value')
      .in(
        'id',
        Array.from(new Set(parsedItems.map((i) => i.ticket_type)))
      )

    if (ticketValueError) {
      throw ticketValueError
    }

    const valueMap = new Map<string, number>(
      (ticketValues ?? []).map((t) => [t.id, Number(t.value)])
    )

    const total = parsedItems.reduce((acc, item) => {
      const unit = valueMap.get(item.ticket_type)
      if (unit === undefined) {
        throw new Error(`Tipo de passe desconhecido: ${item.ticket_type}`)
      }
      return acc + unit * item.quantity
    }, 0)

    // Chama RPC no Supabase (não manipula saldo direto)
    const { data: passIds, error: rpcError } = await supabase.rpc(
      'create_pass_purchase',
      {
        p_user_id: user.id,
        p_items: parsedItems,
        p_source: normalizedSource,
      }
    )

    if (rpcError) {
      throw rpcError
    }

    return NextResponse.json({
      passIds: passIds ?? [],
      total: total.toFixed(2),
      source: normalizedSource,
    })
  } catch (error) {
    if (error instanceof Error && error.message) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return handleError(error)
  }
}
