export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="h-10 w-56 rounded bg-muted animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-48 rounded-lg bg-muted animate-pulse md:col-span-2" />
          <div className="h-32 rounded-lg bg-muted animate-pulse" />
          <div className="h-32 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}
