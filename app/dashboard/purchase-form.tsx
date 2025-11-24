'use client'

import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type TicketType = 'P10' | 'P50' | 'P100'

const PASS_CONFIG: Record<
  TicketType,
  { label: string; description: string; value: number }
> = {
  P10: { label: 'Passe de R$ 10', description: 'Entrada acessível pra começar a jogar.', value: 10 },
  P50: { label: 'Passe de R$ 50', description: 'Opção intermediária pra aumentar suas chances.', value: 50 },
  P100: {
    label: 'Passe de R$ 100',
    description: 'Passe principal, pensado pra longo prazo.',
    value: 100,
  },
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

export function PurchaseForm() {
  const [quantities, setQuantities] = useState<{ P10: number; P50: number; P100: number }>({
    P10: 0,
    P50: 0,
    P100: 0,
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const total = useMemo(() => {
    return (
      quantities.P10 * PASS_CONFIG.P10.value +
      quantities.P50 * PASS_CONFIG.P50.value +
      quantities.P100 * PASS_CONFIG.P100.value
    )
  }, [quantities])

  function updateQuantity(type: TicketType, delta: number) {
    setQuantities((prev) => {
      const next = Math.min(999, Math.max(0, (prev[type] ?? 0) + delta))
      return { ...prev, [type]: next }
    })
  }

  function handleInputChange(type: TicketType, value: string) {
    const parsed = Number.parseInt(value, 10)
    if (Number.isNaN(parsed) || parsed < 0) {
      setQuantities((prev) => ({ ...prev, [type]: 0 }))
      return
    }
    setQuantities((prev) => ({ ...prev, [type]: Math.min(999, parsed) }))
  }

  async function handleSubmit() {
    const items = (Object.keys(quantities) as TicketType[])
      .map((type) => ({ ticket_type: type, quantity: quantities[type] }))
      .filter((item) => item.quantity > 0)

    if (items.length === 0 || total <= 0) {
      setErrorMessage('Escolha pelo menos 1 passe para continuar.')
      return
    }

    try {
      setLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const response = await fetch('/api/passes/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, source: 'external' }),
      })

      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(body?.error || 'Não foi possível concluir a compra. Tente novamente.')
      }

      setSuccessMessage(`Compra concluída! ${body?.passIds?.length ?? items.length} passes criados.`)
      setQuantities({ P10: 0, P50: 0, P100: 0 })
      // Se o componente pai precisar reagir, podemos expor um callback futuro (não existente hoje).
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível concluir a compra. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-base font-semibold">Você escolhe quantos passes quer de cada tipo e a gente cuida do resto.</p>
        <p className="text-sm text-muted-foreground">
          Essa compra não usa seu saldo de prêmios. Ele é reservado só para o que você ganhar nos sorteios.
        </p>
        <p className="text-sm text-muted-foreground">Escolha as quantidades e finalize de uma vez só.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(PASS_CONFIG) as TicketType[]).map((type) => {
          const config = PASS_CONFIG[type]
          return (
            <div key={type} className="rounded-lg border bg-muted/40 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold">{config.label}</p>
                <p className="text-xs text-muted-foreground">{config.description}</p>
                <p className="mt-2 text-lg font-bold text-primary">{formatCurrency(config.value)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(type, -1)}
                  disabled={loading}
                >
                  −
                </Button>
                <div className="flex flex-col items-center">
                  <Label htmlFor={`qty-${type}`} className="text-xs text-muted-foreground">
                    Quantidade
                  </Label>
                  <Input
                    id={`qty-${type}`}
                    type="number"
                    min={0}
                    step={1}
                    value={quantities[type]}
                    onChange={(e) => handleInputChange(type, e.target.value)}
                    className="w-20 text-center"
                    disabled={loading}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(type, 1)}
                  disabled={loading}
                >
                  +
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
        <p className="text-sm font-semibold">Total</p>
        <p className="text-2xl font-bold">{formatCurrency(total)}</p>
      </div>

      {errorMessage && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 text-center font-medium">
          {successMessage}
        </div>
      )}

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={loading || total <= 0}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Finalizando...
          </>
        ) : (
          'Finalizar compra'
        )}
      </Button>
    </div>
  )
}
