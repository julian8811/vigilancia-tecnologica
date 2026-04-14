import { requireUser } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, BellOff, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const frequencyLabels: Record<string, string> = {
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
}

export default async function AlertsPage() {
  const user = await requireUser()
  const workspace = user.workspaceMembers[0]?.workspace
  if (!workspace) return <div>Sin workspace</div>

  const alerts = await prisma.alert.findMany({
    where: { project: { workspaceId: workspace.id } },
    include: {
      project: { select: { name: true } },
      strategy: { select: { name: true } },
      alertRuns: { orderBy: { ranAt: 'desc' }, take: 1 },
    },
    orderBy: { nextRunAt: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alertas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {alerts.filter((a) => a.isActive).length} activa{alerts.filter((a) => a.isActive).length !== 1 ? 's' : ''}
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Sin alertas configuradas</p>
          <p className="text-xs text-muted-foreground mt-1">
            Creá alertas desde el detalle de una estrategia de búsqueda
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="py-4 px-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {alert.isActive ? (
                      <Bell className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{alert.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {alert.project.name} · {alert.strategy.name}
                      </p>
                      {alert.nextRunAt && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          Próxima ejecución: {formatDate(alert.nextRunAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">{frequencyLabels[alert.frequency]}</Badge>
                    <Badge variant={alert.isActive ? 'success' : 'secondary'}>
                      {alert.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
