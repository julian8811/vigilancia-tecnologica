import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth/helpers'
import { prisma } from '@vt/database'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, truncate } from '@/lib/utils'
import { FileText, Shield, ExternalLink, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ResultsPage({
  params,
}: {
  params: { id: string; runId: string }
}) {
  await requireUser()

  const run = await prisma.searchRun.findUnique({
    where: { id: params.runId },
    include: {
      sources: true,
      strategy: { include: { versions: { take: 1, orderBy: { versionNumber: 'desc' } } } },
      runRecords: {
        include: {
          record: {
            include: {
              scientificRecord: true,
              patentRecord: true,
              aiAnnotations: { where: { annotationType: 'summary' }, take: 1 },
            },
          },
        },
        take: 50,
      },
    },
  })

  if (!run) notFound()

  const totalRecords = run.runRecords.length

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-bold text-foreground">{run.strategy.name}</h1>
          <StatusBadge status={run.status as any} />
        </div>
        <p className="text-sm text-muted-foreground font-mono">
          {run.strategy.versions[0]?.queryText}
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{totalRecords} resultado{totalRecords !== 1 ? 's' : ''}</span>
        {run.startedAt && <span>Iniciado: {formatDate(run.startedAt)}</span>}
        <div className="flex gap-2">
          {run.sources.map((s) => (
            <Badge key={s.source} variant="outline" className="text-xs">
              {s.source}: {s.resultCount ?? '...'}
            </Badge>
          ))}
        </div>
      </div>

      {run.status === 'running' && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          La búsqueda está en progreso. Recargá la página para ver los resultados actualizados.
        </div>
      )}

      <div className="space-y-3">
        {run.runRecords.map(({ record }) => (
          <Card key={record.id} className="hover:border-border/70 transition-colors">
            <CardContent className="py-4 px-5">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {record.recordType === 'article' ? (
                    <BookOpen className="h-4 w-4 text-primary" />
                  ) : (
                    <Shield className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <p className="font-medium text-sm leading-tight">{record.title}</p>
                    {record.aiAnnotations.length > 0 && (
                      <Badge variant="ai" className="shrink-0 text-xs">IA</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    {record.year && <span>{record.year}</span>}
                    {record.scientificRecord?.journal && (
                      <span className="italic">{record.scientificRecord.journal}</span>
                    )}
                    {record.patentRecord?.jurisdiction && (
                      <Badge variant="outline" className="text-xs">{record.patentRecord.jurisdiction}</Badge>
                    )}
                    {record.isOpenAccess && (
                      <Badge variant="success" className="text-xs">Open Access</Badge>
                    )}
                    {record.citationCount > 0 && (
                      <span>{record.citationCount} citas</span>
                    )}
                  </div>
                  {record.abstract && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {truncate(record.abstract, 250)}
                    </p>
                  )}
                  {record.aiAnnotations[0] && (
                    <div className="mt-2 pl-3 border-l-2 border-violet-500/30">
                      <p className="text-xs text-violet-300 leading-relaxed">
                        {truncate(record.aiAnnotations[0].content, 200)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalRecords === 0 && run.status === 'completed' && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Sin resultados para esta búsqueda</p>
        </div>
      )}
    </div>
  )
}
