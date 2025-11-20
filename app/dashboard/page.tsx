import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LogOut, Ticket, Wallet } from 'lucide-react'
import { logout } from './actions'
import { PurchaseForm } from './purchase-form'
import {
  getDashboardInitialData,
  getRecentDraws,
  getUserTickets,
  getUserTransactions,
} from './queries'
import { createServerClient } from '@/lib/supabase/server'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const [{ profile, wallet, ticketsCount }, supabase] = await Promise.all([
    getDashboardInitialData(),
    createServerClient(),
  ])

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userId = profile?.id ?? user?.id ?? null

  const [userTickets, userTransactions, draws] = userId
    ? await Promise.all([
        getUserTickets(userId),
        getUserTransactions(userId),
        getRecentDraws(),
      ])
    : [[], [], []]

  const userTicketIds = new Set(userTickets.map((ticket) => ticket.id))
  const drawsWithWinnerFlag = draws.map((draw) => ({
    ...draw,
    isCurrentUserWinner: draw.winnerTicketId ? userTicketIds.has(draw.winnerTicketId) : false,
  }))

  if (!profile || !wallet) {
    console.error('[Dashboard] Perfil ou carteira ausentes apos carregamento inicial.')
  }

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Visitante'
  const balanceDisplay = formatCurrency(wallet?.balance ?? 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Loteria Pra Sempre</h1>
            <p className="text-sm text-muted-foreground">
              Ola, <span className="font-semibold">{displayName}</span>
            </p>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {!profile || !wallet ? (
          <Card>
            <CardHeader>
              <CardTitle>Dados indisponiveis</CardTitle>
              <CardDescription>
                Nao encontramos seus dados de perfil ou carteira. Tente sair e entrar novamente.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardDescription>Saldo disponivel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-primary">{balanceDisplay}</span>
                  </div>
                  <div className="mt-6">
                    <Button size="lg">
                      <Wallet className="mr-2 h-5 w-5" /> Adicionar Saldo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <CardTitle>Meus Bilhetes</CardTitle>
                  </div>
                  <CardDescription>Bilhetes ativos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticketsCount === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Voce ainda nao possui bilhetes. Em breve voce podera comprar bilhetes perpetuos
                      aqui.
                    </p>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">{ticketsCount}</span>
                      <span className="text-sm text-muted-foreground">ativos</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <PurchaseForm />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Historico de bilhetes</CardTitle>
                  <CardDescription>Ultimos bilhetes criados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userTickets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Voce ainda nao possui bilhetes registrados.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {userTickets.map((ticket) => (
                        <li key={ticket.id} className="rounded-md border p-3">
                          <div className="text-sm font-semibold truncate">{ticket.id}</div>
                          <div className="text-xs text-muted-foreground">
                            Status: {ticket.status ?? 'indefinido'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Criado em: {formatDate(ticket.purchaseDate ?? ticket.createdAt)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Historico de transacoes</CardTitle>
                  <CardDescription>Movimentacoes recentes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userTransactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Voce ainda nao possui transacoes registradas.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {userTransactions.map((tx) => (
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
                          <div className="text-xs text-muted-foreground">
                            {formatDate(tx.createdAt)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Sorteios recentes</CardTitle>
            <CardDescription>Ultimos sorteios realizados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {drawsWithWinnerFlag.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Ainda nao foram realizados sorteios.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {drawsWithWinnerFlag.map((draw) => (
                        <li key={draw.id} className="rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">
                              {formatCurrency(draw.prizeAmount)}
                            </span>
                            {draw.isCurrentUserWinner ? (
                              <span className="text-xs font-semibold text-emerald-600">
                                Voce venceu
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {draw.status ?? ''}
                              </span>
                            )}
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
            </div>
          </>
        )}
      </main>
    </div>
  )
}
