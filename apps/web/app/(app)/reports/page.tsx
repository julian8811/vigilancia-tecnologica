import { requireUser } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

const reportTypeLabels: Record<string, string> = {
  technical: 'Técnico',
  executive: 'Ejecutivo',
  bulletin: 'Boletín',
  ficha_tecnologica: 'Ficha Tecnológica',
  ficha_patente: 'Ficha de Patente',
  state_of_art: 'Estado del Arte',
  competitive: 'Competitivo',
  comparison_matrix: 'Matriz Comparativa',
}

export default async function ReportsPage() {
  const user = await requireUser()
  const workspace = user.workspaceMembers[0]?.workspace

  if (!workspace) return <div>Sin workspace</div>

  const reports = await prisma.report.findMany({
    where: {
      project: { workspaceId: workspace.id },
    },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Informes</h1>
        <p className="text-muted-foreground text-sm mt-1">{reports.length} informe{reports.length !== 1 ? 's' : ''}</p>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Sin informes todavía</p>
          <p className="text-xs text-muted-foreground mt-1">Los informes se generan desde los resultados de búsqueda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.project.name} · {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{reportTypeLabels[report.reportType] || report.reportType}</Badge>
                  <Badge variant={report.status === 'ready' ? 'success' : report.status === 'failed' ? 'destructive' : 'warning'}>
                    {report.status}
                  </Badge>
                  {report.status === 'ready' && (
                    <a href={`/api/reports/${report.id}/download`}>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1.5" />PDF
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
