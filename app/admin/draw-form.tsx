'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DrawActionState } from './draw-state'
import { DRAW_INITIAL_STATE } from './draw-state'
import { runDraw } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Executando...
        </>
      ) : (
        'Executar sorteio'
      )}
    </Button>
  )
}

function DrawStatus({ state }: { state: DrawActionState }) {
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
        {state.message}
      </div>
    )
  }

  return null
}

export function DrawForm() {
  const [state, action] = useFormState(runDraw, DRAW_INITIAL_STATE)

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Valor do premio</Label>
        <Input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="drawType">Tipo do sorteio (opcional)</Label>
        <Input id="drawType" name="drawType" type="text" placeholder="manual" />
      </div>

      <DrawStatus state={state} />
      <SubmitButton />
    </form>
  )
}
