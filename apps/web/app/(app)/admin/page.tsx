import { requireRole } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, FolderOpen, Database, Activity } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AdminPage() {
  const { user } = await requireRole('placeholder', 'admin').catch(async () => {
    // requireRole needs workspaceId — get it from user
    const { requireUser } = await import('@/lib/auth/helpers')
    const u = await requireUser()
    const workspaceId = u.workspaceMembers[0]?.workspaceId || ''
    return requireRole(workspaceId, 'admin')
  })

  const [userCount, workspaceCount, recordCount, runCount] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count({ where: { deletedAt: null } }),
    prisma.normalizedRecord.count({ where: { deletedAt: null } }),
    prisma.searchRun.count(),
  ])

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      workspaceMembers: { include: { workspace: true }, take: 1 },
    },
  })

  const recentRuns = await prisma.searchRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10,
    include: { strategy: { select: { name: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
        <p className="text-muted-foreground text-sm mt-1">Vista del sistema</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Usuarios</p>
            </div>
            <p className="text-3xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Workspaces</p>
            </div>
            <p className="text-3xl font-bold">{workspaceCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Registros</p>
            </div>
            <p className="text-3xl font-bold">{recordCount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Búsquedas</p>
            </div>
            <p className="text-3xl font-bold">{runCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Usuarios recientes</h2>
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between text-sm py-2 border-b border-border/50">
                <div>
                  <p className="font-medium">{u.fullName || u.email}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Búsquedas recientes</h2>
          <div className="space-y-2">
            {recentRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between text-sm py-2 border-b border-border/50">
                <div>
                  <p className="font-medium">{run.strategy.name}</p>
                  <p className="text-xs text-muted-foreground">{run.status}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(run.startedAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
