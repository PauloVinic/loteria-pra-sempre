import { cookies, headers } from 'next/headers'
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

type WalletResponse = { balance: string | number }
type PassItem = {
  id: string
  ticket_type: 'P10' | 'P50' | 'P100'
  face_value: number
  status: string
  purchase_date: string
}
type PassesResponse = { items: PassItem[] }
type TransactionItem = {
  id: number
  type: string
  amount: number
  created_at: string
}
type TransactionsResponse = { items: TransactionItem[] }

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
  const origin =
    headers().get('x-forwarded-host')
      ? `${headers().get('x-forwarded-proto') ?? 'https'}://${headers().get('x-forwarded-host')}`
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const cookieHeader = cookies().toString()

  let wallet: WalletResponse | null = null
  let passes: PassItem[] = []
  let transactions: TransactionItem[] = []
  let loadError: string | null = null

  try {
    const [walletRes, passesRes, transactionsRes] = await Promise.all([
      fetch(new URL('/api/wallet/me', origin), {
        cache: 'no-store',
        headers: { cookie: cookieHeader },
      }),
      fetch(new URL('/api/passes/me', origin), {
        cache: 'no-store',
        headers: { cookie: cookieHeader },
      }),
      fetch(new URL('/api/transactions/me', origin), {
        cache: 'no-store',
        headers: { cookie: cookieHeader },
      }),
    ])

    if (!walletRes.ok) throw new Error('Falha ao carregar saldo.')
    if (!passesRes.ok) throw new Error('Falha ao carregar passes.')
    if (!transactionsRes.ok) throw new Error('Falha ao carregar transações.')

    const walletData = (await walletRes.json()) as WalletResponse
    const passesData = (await passesRes.json()) as PassesResponse
    const transactionsData = (await transactionsRes.json()) as TransactionsResponse

    wallet = walletData
    passes = passesData.items ?? []
    transactions = transactionsData.items ?? []
  } catch (error) {
    console.error('[Dashboard] Erro ao carregar dados do dashboard', error)
    loadError = 'Não foi possível carregar seus dados agora. Tente novamente mais tarde.'
  }

  const balanceNumber = Number(wallet?.balance ?? 0)
  const balanceDisplay = formatCurrency(balanceNumber)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Loteria Pra Sempre</h1>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {loadError ? (
          <Card>
            <CardHeader>
              <CardTitle>Dados indisponíveis</CardTitle>
              <CardDescription>{loadError}</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardDescription>Saldo de prêmios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-primary">{balanceDisplay}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {balanceNumber > 0
                      ? 'Esse valor veio dos prêmios que você ganhou. Você pode pedir saque ou usar em novos passes.'
                      : 'Aqui aparece o que você já ganhou nos sorteios. Assim que pintar um prêmio, o saldo vem pra cá.'}
                  </p>
                  <div className="mt-6">
                    <Button
                      size="lg"
                      variant="outline"
                      disabled={balanceNumber <= 0}
                      title={balanceNumber <= 0 ? 'Você ainda não tem prêmios para sacar.' : 'Em breve: solicitar saque'}
                    >
                      <Wallet className="mr-2 h-5 w-5" /> Pedir saque
                    </Button>
                    {balanceNumber <= 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Você ainda não tem prêmios para sacar.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <CardTitle>Comprar passes</CardTitle>
                  </div>
                  <CardDescription>
                    Você escolhe quantos passes quer de cada tipo e a gente cuida do resto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Escolha quantos passes quer de cada tipo e finalize direto. O saldo de prêmios entra depois, quando você ganhar.
                  </p>
                  <div className="pt-2 border-t">
                    <PurchaseForm />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Historico de passes</CardTitle>
                  <CardDescription>Ultimos passes criados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Voce ainda nao possui passes registrados.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {passes.map((ticket) => (
                        <li key={ticket.id} className="rounded-md border p-3">
                          <div className="text-sm font-semibold truncate">{ticket.id}</div>
                          <div className="text-xs text-muted-foreground">
                            Status: {ticket.status ?? 'indefinido'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Criado em: {formatDate((ticket as any).purchaseDate ?? ticket.purchase_date)}
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
                  {transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Voce ainda nao possui transacoes registradas.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {transactions.map((tx) => (
                        <li key={tx.id} className="rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">{tx.type}</span>
                            <span
                              className={`text-sm font-bold ${
                                tx.amount < 0 ? 'text-destructive' : 'text-emerald-600'
                              }`}
                            >
                              {formatCurrency(tx.amount ?? 0)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate((tx as any).createdAt ?? tx.created_at)}
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
