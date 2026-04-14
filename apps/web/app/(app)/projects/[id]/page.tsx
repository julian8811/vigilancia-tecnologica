import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireUser } from '@/lib/auth/helpers'
import { prisma } from '@vt/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Play, Clock } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  await requireUser()

  const project = await prisma.project.findUnique({
    where: { id: params.id, deletedAt: null },
    include: {
      strategies: {
        where: { deletedAt: null },
        include: {
          versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
          searchRuns: { orderBy: { startedAt: 'desc' }, take: 1 },
          _count: { select: { searchRuns: true } },
        },
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  if (!project) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color || '#3B82F6' }} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground text-sm mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <Link href={`/projects/${project.id}/search`}>
          <Button size="sm"><Plus className="h-4 w-4 mr-2" />Nueva estrategia</Button>
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Estrategias de búsqueda ({project.strategies.length})
        </h2>

        {project.strategies.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">Sin estrategias todavía</p>
              <p className="text-xs text-muted-foreground mb-4">Creá una estrategia de búsqueda booleana</p>
              <Link href={`/projects/${project.id}/search`}>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" />Crear estrategia</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {project.strategies.map((strategy) => {
              const lastRun = strategy.searchRuns[0]
              const currentVersion = strategy.versions[0]
              return (
                <Card key={strategy.id} className="hover:border-border/80 transition-colors">
                  <CardContent className="py-4 px-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{strategy.name}</p>
                          {currentVersion && (
                            <Badge variant="outline" className="text-xs shrink-0">v{currentVersion.versionNumber}</Badge>
                          )}
                        </div>
                        {currentVersion?.queryText && (
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {currentVersion.queryText}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {strategy._count.searchRuns} ejecución{strategy._count.searchRuns !== 1 ? 'es' : ''}
                          </span>
                          {lastRun && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Último: {formatDate(lastRun.startedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {lastRun && <StatusBadge status={lastRun.status as any} />}
                        <Link href={`/projects/${project.id}/search?strategy=${strategy.id}`}>
                          <Button size="sm" variant="outline"><Search className="h-3 w-3 mr-1.5" />Buscar</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
