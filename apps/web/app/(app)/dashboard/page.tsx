import { requireUser } from '@/lib/auth/helpers'

export default async function DashboardPage() {
  const user = await requireUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenido, {user.fullName?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Plataforma de Vigilancia Tecnológica
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Proyectos activos</p>
          <p className="text-3xl font-bold text-foreground mt-1">0</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Registros totales</p>
          <p className="text-3xl font-bold text-foreground mt-1">0</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Alertas activas</p>
          <p className="text-3xl font-bold text-foreground mt-1">0</p>
        </div>
      </div>
    </div>
  )
}
