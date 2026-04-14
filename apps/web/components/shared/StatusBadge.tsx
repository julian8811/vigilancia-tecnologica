import { Badge } from '@/components/ui/badge'

type Status = 'pending' | 'running' | 'completed' | 'failed' | 'active' | 'archived'

const statusConfig: Record<Status, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline' }> = {
  pending: { label: 'Pendiente', variant: 'warning' },
  running: { label: 'Ejecutando', variant: 'default' },
  completed: { label: 'Completado', variant: 'success' },
  failed: { label: 'Fallido', variant: 'destructive' },
  active: { label: 'Activo', variant: 'success' },
  archived: { label: 'Archivado', variant: 'secondary' },
}

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] || { label: status, variant: 'outline' as const }
  return <Badge variant={config.variant as any}>{config.label}</Badge>
}
