import { requireUser } from '@/lib/auth/helpers'
import { prisma } from '@vt/database'
import { Card, CardContent } from '@/components/ui/card'
import { BookMarked } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function CollectionsPage() {
  const user = await requireUser()

  const collections = await prisma.savedCollection.findMany({
    where: { userId: user.id },
    include: { _count: { select: { items: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Colecciones</h1>
        <p className="text-muted-foreground text-sm mt-1">{collections.length} colección{collections.length !== 1 ? 'es' : ''}</p>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookMarked className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Sin colecciones todavía</p>
          <p className="text-xs text-muted-foreground mt-1">
            Guardá registros en colecciones desde los resultados de búsqueda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {collections.map((col) => (
            <Card key={col.id} className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1">
                  <BookMarked className="h-4 w-4 text-primary shrink-0" />
                  <p className="font-medium text-sm">{col.name}</p>
                </div>
                {col.description && (
                  <p className="text-xs text-muted-foreground mb-2">{col.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {col._count.items} registro{col._count.items !== 1 ? 's' : ''} · {formatDate(col.updatedAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
