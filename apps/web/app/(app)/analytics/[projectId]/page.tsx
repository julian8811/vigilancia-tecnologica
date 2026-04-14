import { requireUser } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Globe, TrendingUp, Users } from 'lucide-react'

export default async function AnalyticsPage({ params }: { params: { projectId: string } }) {
  await requireUser()

  const project = await prisma.project.findUnique({
    where: { id: params.projectId, deletedAt: null },
    include: {
      _count: {
        select: { strategies: true, reports: true, alerts: true },
      },
    },
  })

  if (!project) notFound()

  // Summary stats
  const totalRecords = await prisma.normalizedRecord.count({
    where: {
      runRecords: {
        some: { run: { strategy: { projectId: params.projectId } } },
      },
      deletedAt: null,
    },
  })

  const articleCount = await prisma.normalizedRecord.count({
    where: {
      recordType: 'article',
      runRecords: { some: { run: { strategy: { projectId: params.projectId } } } },
      deletedAt: null,
    },
  })

  const patentCount = totalRecords - articleCount

  const runCount = await prisma.searchRun.count({
    where: { strategy: { projectId: params.projectId } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics — {project.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visualizaciones y estadísticas del corpus de vigilancia
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total registros</p>
            <p className="text-3xl font-bold mt-1">{totalRecords.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Artículos</p>
            <p className="text-3xl font-bold mt-1 text-primary">{articleCount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Patentes</p>
            <p className="text-3xl font-bold mt-1 text-amber-400">{patentCount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Búsquedas</p>
            <p className="text-3xl font-bold mt-1">{runCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Publicaciones por año
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Gráfico disponible cuando haya datos de búsquedas ejecutadas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Países líderes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Distribución geográfica disponible con datos reales.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
