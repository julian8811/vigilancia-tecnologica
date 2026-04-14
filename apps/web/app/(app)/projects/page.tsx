import Link from 'next/link'
import { requireUser } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default async function ProjectsPage() {
  const user = await requireUser()
  const workspace = user.workspaceMembers[0]?.workspace

  if (!workspace) {
    return <div className="text-muted-foreground">No hay workspace disponible.</div>
  }

  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id, deletedAt: null },
    include: {
      _count: { select: { strategies: true, reports: true, alerts: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proyectos</h1>
          <p className="text-muted-foreground text-sm mt-1">{projects.length} proyecto{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/projects/new">
          <Button size="sm"><Plus className="h-4 w-4 mr-2" />Nuevo proyecto</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Sin proyectos todavía</h3>
          <p className="text-sm text-muted-foreground mb-4">Creá tu primer proyecto de vigilancia tecnológica</p>
          <Link href="/projects/new">
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />Crear proyecto</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: project.color || '#3B82F6' }}
                      />
                      <CardTitle className="text-base leading-tight">{project.name}</CardTitle>
                    </div>
                    <Badge variant={project.status === 'active' ? 'success' : 'secondary'} className="shrink-0 text-xs">
                      {project.status === 'active' ? 'Activo' : 'Archivado'}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      {project._count.strategies} estrategia{project._count.strategies !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Actualizado {formatDate(project.updatedAt)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
