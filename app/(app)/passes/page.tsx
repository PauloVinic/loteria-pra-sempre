"use client"

import { useEffect, useMemo, useState } from 'react'

// Página de passes autenticada. Caso sua área privada use outra pasta, mova este arquivo
// para o layout correspondente (ex: app/dashboard) e mantenha o mesmo componente.

type WalletResponse = {
  balance: string
}

type PassItem = {
  id: string
  ticket_type: 'P10' | 'P50' | 'P100'
  face_value: number
  status: 'active' | 'won'
  purchase_date: string
}

type PassesResponse = {
  items: PassItem[]
}

type PurchaseSource = 'external' | 'wallet'

type PurchasePayload = {
  source: PurchaseSource
  items: { ticket_type: 'P10' | 'P50' | 'P100'; quantity: number }[]
}

const PASS_VALUES: Record<'P10' | 'P50' | 'P100', number> = {
  P10: 10,
  P50: 50,
  P100: 100,
}

const formatterBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
})

const formatterDateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export default function PassesPage() {
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [passes, setPasses] = useState<PassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<{ P10: number; P50: number; P100: number }>(
    { P10: 0, P50: 0, P100: 0 }
  )

  const total = useMemo(() => {
    return (
      quantities.P10 * PASS_VALUES.P10 +
      quantities.P50 * PASS_VALUES.P50 +
      quantities.P100 * PASS_VALUES.P100
    )
  }, [quantities])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      setErrorMessage(null)

      const [walletRes, passesRes] = await Promise.all([
        fetch('/api/wallet/me', { cache: 'no-store' }),
        fetch('/api/passes/me', { cache: 'no-store' }),
      ])

      if (!walletRes.ok) throw new Error('Não foi possível carregar o saldo.')
      if (!passesRes.ok) throw new Error('Não foi possível carregar seus passes.')

      const walletData = (await walletRes.json()) as WalletResponse
      const passesData = (await passesRes.json()) as PassesResponse

      setWalletBalance(Number(walletData.balance ?? 0))
      setPasses(passesData.items ?? [])
    } catch (error) {
      console.error(error)
      setErrorMessage('Houve um problema ao carregar seus dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function updateQuantity(key: 'P10' | 'P50' | 'P100', delta: number) {
    setQuantities((prev) => {
      const next = Math.min(99, Math.max(0, prev[key] + delta))
      return { ...prev, [key]: next }
    })
  }

  function setQuantity(key: 'P10' | 'P50' | 'P100', value: number) {
    const parsed = Number.isFinite(value) ? value : 0
    setQuantities((prev) => ({ ...prev, [key]: Math.min(99, Math.max(0, parsed)) }))
  }

  async function handlePurchase(source: PurchaseSource) {
    if (total <= 0) {
      setErrorMessage('Escolha pelo menos 1 passe pra continuar.')
      return
    }

    if (source === 'wallet' && walletBalance < total) {
      setErrorMessage('Saldo insuficiente pra essa compra.')
      return
    }

    const payload: PurchasePayload = {
      source,
      items: [
        { ticket_type: 'P10', quantity: quantities.P10 },
        { ticket_type: 'P50', quantity: quantities.P50 },
        { ticket_type: 'P100', quantity: quantities.P100 },
      ].filter((item) => item.quantity > 0),
    }

    try {
      setPurchaseLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const response = await fetch('/api/passes/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Não foi possível concluir a compra.')
      }

      setQuantities({ P10: 0, P50: 0, P100: 0 })
      setSuccessMessage('Compra realizada! Seus novos passes já estão na lista.')

      await fetchData()
    } catch (error) {
      console.error(error)
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao processar a compra.')
    } finally {
      setPurchaseLoading(false)
    }
  }

  const totalText = total > 0 ? formatterBRL.format(total) : 'Escolha pelo menos 1 passe pra continuar.'
  const insufficientBalance = total > 0 && walletBalance < total

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-slate-300">Carregando seus passes e saldo...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-emerald-300">Meus passes</h1>
          <p className="mt-2 text-slate-300">
            Aqui você vê tudo o que já garantiu e ainda pode pegar mais passes pra turbinar sua sorte.
          </p>
        </header>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {successMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Coluna esquerda: saldo + passes */}
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-100">Saldo de prêmios</h2>
              </div>
              <p className="text-3xl font-semibold text-emerald-300">
                {formatterBRL.format(walletBalance)}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Esse saldo vem só dos prêmios que você ganhou. Você pode usar pra comprar mais passes ou pedir saque.
              </p>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Seus passes ativos</h3>
              </div>

              {passes.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">
                  Você ainda não tem nenhum passe. Que tal começar pegando um agora do lado direito?
                </p>
              ) : (
                <div className="mt-4 space-y-3 overflow-y-auto">
                  {passes.map((pass) => (
                    <div
                      key={pass.id}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">
                            Passe de {formatterBRL.format(pass.face_value)}
                          </p>
                          <p className="text-xs text-slate-400">
                            Tipo: {pass.ticket_type} • Status: {pass.status === 'active' ? 'ativo' : 'premiado'}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400">
                          {formatterDateTime.format(new Date(pass.purchase_date))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Coluna direita: compra de passes */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Comprar novos passes</h3>
            </div>

            <div className="space-y-4">
              {(['P10', 'P50', 'P100'] as const).map((id) => (
                <div
                  key={id}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-100">
                        Passe de {formatterBRL.format(PASS_VALUES[id])}
                      </p>
                      <p className="text-sm text-slate-400">
                        Participa de todos os sorteios enquanto o jogo existir.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-slate-700"
                        onClick={() => updateQuantity(id, -1)}
                        disabled={purchaseLoading}
                      >
                        −
                      </button>
                      <input
                        aria-label={`Quantidade para ${id}`}
                        className="h-9 w-14 rounded-md border border-slate-800 bg-slate-950 text-center text-slate-100"
                        value={quantities[id]}
                        onChange={(e) => setQuantity(id, Number(e.target.value))}
                        type="number"
                        min={0}
                        max={99}
                        disabled={purchaseLoading}
                      />
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-slate-700"
                        onClick={() => updateQuantity(id, 1)}
                        disabled={purchaseLoading}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3">
              <p className="text-sm font-semibold text-slate-200">Total da compra</p>
              <p className="text-xl font-semibold text-emerald-300">
                {total > 0 ? formatterBRL.format(total) : totalText}
              </p>
              {insufficientBalance && (
                <p className="text-xs text-red-300">Saldo insuficiente pra essa compra.</p>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                className="h-11 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handlePurchase('external')}
                disabled={purchaseLoading || total <= 0}
              >
                {purchaseLoading ? 'Processando...' : 'Comprar agora'}
              </button>

              <button
                type="button"
                className="h-11 rounded-lg border border-emerald-500/60 bg-transparent px-4 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handlePurchase('wallet')}
                disabled={purchaseLoading || total <= 0 || insufficientBalance}
                title={insufficientBalance ? 'Saldo insuficiente pra essa compra.' : undefined}
              >
                {purchaseLoading ? 'Processando...' : 'Usar meu saldo'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
