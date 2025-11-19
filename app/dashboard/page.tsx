import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LogOut, Wallet, Ticket } from 'lucide-react'
import { logout } from './actions'

async function getUserData() {
  const supabase = await createServerClient()

  // Verifica se o usuário está autenticado
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Busca o perfil do usuário
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Erro ao buscar perfil:', profileError)
  }

  // Busca a carteira do usuário
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  if (walletError) {
    console.error('Erro ao buscar carteira:', walletError)
  }

  // Conta os bilhetes ativos
  const { count: ticketsCount, error: ticketsError } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (ticketsError) {
    console.error('Erro ao contar bilhetes:', ticketsError)
  }

  return {
    profile: profile || {
      id: user.id,
      email: user.email || '',
      full_name: null,
    },
    wallet: wallet || { balance: '0.00' },
    ticketsCount: ticketsCount || 0,
  }
}

function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" size="sm">
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </form>
  )
}

export default async function DashboardPage() {
  const { profile, wallet, ticketsCount } = await getUserData()

  const displayName = profile.full_name || profile.email?.split('@')[0] || 'Usuário'
  const balance = parseFloat(wallet.balance || '0').toFixed(2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Loteria Pra Sempre</h1>
            <p className="text-sm text-muted-foreground">
              Olá, <span className="font-semibold">{displayName}</span>
            </p>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card de Saldo */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardDescription>Saldo Disponível</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary">
                  R$ {balance}
                </span>
              </div>
              <div className="mt-6">
                <Button size="lg" className="w-full md:w-auto">
                  <Wallet className="mr-2 h-5 w-5" />
                  Adicionar Saldo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card de Bilhetes */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                <CardTitle>Meus Bilhetes</CardTitle>
              </div>
              <CardDescription>Bilhetes ativos na loteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{ticketsCount}</span>
                <span className="text-muted-foreground">bilhetes</span>
              </div>
            </CardContent>
          </Card>

          {/* Card de Informações (placeholder para futuras features) */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
              <CardDescription>Dados da sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                {profile.full_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{profile.full_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

