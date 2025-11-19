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
  console.log('🔍 [Dashboard] Iniciando getUserData...')
  const supabase = await createServerClient()

  // Verifica autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.log('🚫 [Dashboard] Usuário não autenticado, redirecionando...')
    redirect('/login')
  }
  console.log('✅ [Dashboard] Usuário autenticado:', user.email)

  // Busca Dados (com tratamento de erro seguro)
  console.log('🔍 [Dashboard] Buscando perfil e carteira...')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', user.id)
    .single()
    
  const { count: ticketsCount } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active')

  console.log('✅ [Dashboard] Dados buscados com sucesso.')

  return {
    user,
    profile: profile || { full_name: 'Usuário', email: user.email },
    wallet: wallet || { balance: 0 }, // Garante que não quebra se for null
    ticketsCount: ticketsCount || 0
  }
}

export default async function DashboardPage() {
  console.log('🚀 [Dashboard] Renderizando página...')
  const { profile, wallet, ticketsCount } = await getUserData()

  const displayName = profile.full_name || profile.email?.split('@')[0] || 'Visitante'
  // Converte para número com segurança antes de fixar casas decimais
  const balanceVal = Number(wallet.balance || 0)
  const balanceDisplay = balanceVal.toFixed(2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Loteria Pra Sempre</h1>
            <p className="text-sm text-muted-foreground">
              Olá, <span className="font-semibold">{displayName}</span>
            </p>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardDescription>Saldo Disponível</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary">
                  R$ {balanceDisplay}
                </span>
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
            <CardContent>
              <span className="text-4xl font-bold">{ticketsCount}</span>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}