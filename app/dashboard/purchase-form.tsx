'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { PurchaseActionState } from './purchase-state'
import { PURCHASE_INITIAL_STATE } from './purchase-state'
import { purchaseTickets } from './actions'
import { TICKET_PRICE } from './constants'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

function PurchaseStatus({ state }: { state: PurchaseActionState }) {
  if (state.status === 'error') {
    return (
      <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium">
        {state.message}
      </div>
    )
  }

  if (state.status === 'success') {
    return (
      <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 text-center font-medium">
        {state.message ?? 'Compra realizada com sucesso.'}
      </div>
    )
  }

  return null
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Comprando...
        </>
      ) : (
        'Comprar bilhetes'
      )}
    </Button>
  )
}

export function PurchaseForm() {
  const [purchaseState, purchaseAction] = useFormState(
    purchaseTickets,
    PURCHASE_INITIAL_STATE,
  )

  return (
    <form action={purchaseAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantidade de bilhetes</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          step={1}
          placeholder="1"
          inputMode="numeric"
          required
        />
        {purchaseState.fieldErrors?.quantity && (
          <p className="text-sm text-destructive">{purchaseState.fieldErrors.quantity}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Preço por bilhete: {formatCurrency(TICKET_PRICE)}
        </p>
      </div>

      <PurchaseStatus state={purchaseState} />

      <SubmitButton />
    </form>
  )
}
