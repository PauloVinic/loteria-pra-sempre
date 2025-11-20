import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getAllDraws,
  getAllTickets,
  getAllTransactions,
  getAllUsers,
  getAllWallets,
} from './queries'
import { createServerClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/is-admin'
import { DrawForm } from './draw-form'
import Link from 'next/link'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

function formatDate(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function AdminPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) {
    redirect('/dashboard')
  }

  const [users, wallets, tickets, transactions, draws] = await Promise.all([
    getAllUsers(),
    getAllWallets(),
    getAllTickets(),
    getAllTransactions(),
    getAllDraws(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Painel Admin</h1>
            <p className="text-sm text-muted-foreground">Somente leitura</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent"
          >
            Voltar
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Executar sorteio</CardTitle>
            <CardDescription>Aciona a RPC transacional perform_draw</CardDescription>
          </CardHeader>
          <CardContent>
            <DrawForm />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>Perfis cadastrados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
              ) : (
                <ul className="space-y-2">
                  {users.map((u) => (
                    <li key={u.id} className="rounded-md border p-3">
                      <div className="text-sm font-semibold truncate">{u.email}</div>
                      <div className="text-xs text-muted-foreground">ID: {u.id}</div>
                      <div className="text-xs text-muted-foreground">
                        Criado em: {formatDate(u.createdAt)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wallets</CardTitle>
              <CardDescription>Saldos por usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {wallets.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
              ) : (
                <ul className="space-y-2">
                  {wallets.map((w) => (
                    <li key={w.userId} className="rounded-md border p-3">
                      <div className="text-sm font-semibold truncate">{w.userId}</div>
                      <div className="text-xs text-muted-foreground">
                        Saldo: {formatCurrency(w.balance)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Atualizado em: {formatDate(w.updatedAt)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>Ultimos tickets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
              ) : (
                <ul className="space-y-2">
                  {tickets.map((t) => (
                    <li key={t.id} className="rounded-md border p-3">
                      <div className="text-sm font-semibold truncate">{t.id}</div>
                      <div className="text-xs text-muted-foreground">User: {t.userId}</div>
                      <div className="text-xs text-muted-foreground">
                        Criado em: {formatDate(t.createdAt)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transacoes</CardTitle>
              <CardDescription>Movimentacoes recentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
              ) : (
                <ul className="space-y-2">
                  {transactions.map((tx) => (
                    <li key={tx.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{tx.type}</span>
                        <span
                          className={`text-sm font-bold ${
                            tx.amount < 0 ? 'text-destructive' : 'text-emerald-600'
                          }`}
                        >
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">User: {tx.userId}</div>
                      <div className="text-xs text-muted-foreground">
                        Criado em: {formatDate(tx.createdAt)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sorteios</CardTitle>
            <CardDescription>Ultimos sorteios registrados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {draws.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ainda nao ha sorteios registrados.</p>
            ) : (
              <ul className="space-y-2">
                {draws.map((draw) => (
                  <li key={draw.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{formatCurrency(draw.prizeAmount)}</span>
                      <span className="text-xs text-muted-foreground">{draw.status ?? ''}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ticket vencedor: {draw.winnerTicketId ?? '-'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Data: {formatDate(draw.drawDate ?? draw.completedAt)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
