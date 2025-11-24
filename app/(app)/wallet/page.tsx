"use client"

import { useEffect, useMemo, useState } from 'react'

// Tela de Carteira & Histórico. Se sua área autenticada usar outro layout (ex: app/dashboard),
// mova este arquivo mantendo o mesmo componente.

type WalletResponse = {
  balance: string
}

type Transaction = {
  id: number
  type: TransactionType
  amount: number
  created_at: string
  ticket_id: string | null
  draw_id: string | null
}

type TransactionsResponse = {
  items: Transaction[]
}

type TransactionType =
  | 'PASS_PURCHASE_EXTERNAL'
  | 'PASS_PURCHASE_FROM_WALLET'
  | 'PRIZE_CREDIT'
  | 'WITHDRAWAL'

const formatterBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
})

const formatterDateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function describeTransaction(type: TransactionType): string {
  switch (type) {
    case 'PASS_PURCHASE_EXTERNAL':
      return 'Compra de passes (pagamento externo)'
    case 'PASS_PURCHASE_FROM_WALLET':
      return 'Compra de passes usando saldo de prêmios'
    case 'PRIZE_CREDIT':
      return 'Prêmio recebido'
    case 'WITHDRAWAL':
      return 'Saque solicitado'
    default:
      return 'Movimento'
  }
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      setErrorMessage(null)

      const [walletRes, txRes] = await Promise.all([
        fetch('/api/wallet/me', { cache: 'no-store' }),
        fetch('/api/transactions/me', { cache: 'no-store' }),
      ])

      if (!walletRes.ok) throw new Error('Não foi possível carregar o saldo.')
      if (!txRes.ok) throw new Error('Não foi possível carregar o histórico.')

      const walletData = (await walletRes.json()) as WalletResponse
      const txData = (await txRes.json()) as TransactionsResponse

      setBalance(Number(walletData.balance ?? 0))
      setTransactions(txData.items ?? [])
    } catch (error) {
      console.error(error)
      setErrorMessage('Houve um problema ao carregar seus dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const withdrawNumber = useMemo(() => Number(withdrawAmount), [withdrawAmount])
  const withdrawDisabled =
    isSubmitting || !withdrawAmount || withdrawNumber <= 0 || withdrawNumber > balance

  async function handleWithdraw() {
    if (withdrawNumber <= 0) {
      setErrorMessage('Informe um valor maior que zero para sacar.')
      return
    }

    if (withdrawNumber > balance) {
      setErrorMessage('Você não pode sacar mais do que tem na carteira.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: withdrawNumber }),
      })

      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(body?.error || 'Não foi possível solicitar o saque.')
      }

      setSuccessMessage('Saque solicitado! Status inicial: pending.')
      setWithdrawAmount('')

      await fetchData()
    } catch (error) {
      console.error(error)
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao solicitar saque.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-slate-300">Carregando carteira e histórico...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-emerald-300">Carteira & Histórico</h1>
          <p className="mt-2 text-slate-300">
            Aqui você cuida do saldo dos seus prêmios e acompanha tudo o que rolou na sua conta.
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

        <div className="space-y-6">
          {/* Card de saldo e saque */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-100">Saldo de prêmios disponível</h2>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">
              {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Esse saldo vem só dos prêmios que você já ganhou. Você pode usar pra comprar mais passes ou pedir um saque.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <label className="block text-sm font-semibold text-slate-200" htmlFor="withdrawAmount">
                  Valor para saque
                </label>
                <input
                  id="withdrawAmount"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="100.00"
                  className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={isSubmitting}
                />
                {withdrawNumber > balance && (
                  <p className="mt-1 text-xs text-red-300">Você não pode sacar mais do que tem na carteira.</p>
                )}
              </div>
              <button
                type="button"
                className="h-11 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleWithdraw}
                disabled={withdrawDisabled}
              >
                {isSubmitting ? 'Processando...' : 'Solicitar saque'}
              </button>
            </div>
          </section>

          {/* Card de histórico */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Histórico de movimentos</h3>
                <p className="text-sm text-slate-400">
                  Tudo o que entrou e saiu da sua conta aparece aqui.
                </p>
              </div>
            </div>

            {transactions.length === 0 ? (
              <p className="text-sm text-slate-400">
                Ainda não rolou nenhum movimento por aqui. Assim que você ganhar prêmio, comprar passes ou pedir saque, aparece tudo nessa lista.
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const isCredit = tx.amount > 0
                  return (
                    <div
                      key={tx.id}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">
                            {describeTransaction(tx.type)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatterDateTime.format(new Date(tx.created_at))}
                          </p>
                        </div>
                        <p className={`text-sm font-semibold ${isCredit ? 'text-emerald-300' : 'text-red-300'}`}>
                          {formatterBRL.format(tx.amount)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
