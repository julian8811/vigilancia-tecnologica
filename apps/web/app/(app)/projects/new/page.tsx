'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])

  // We need workspaceId — get it from the user's first workspace
  // This is a simplified version; in production use a workspace context
  const { data: workspaces } = trpc.workspace.list.useQuery()
  const workspaceId = workspaces?.[0]?.id

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (project) => router.push(`/projects/${project.id}`),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspaceId || !name.trim()) return
    createProject.mutate({ workspaceId, name: name.trim(), description: description.trim() || undefined, color })
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Nuevo proyecto</h1>
        <p className="text-muted-foreground text-sm mt-1">Creá un espacio para organizar tus búsquedas</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="ej. Biotecnología agrícola 2025"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe el objetivo del proyecto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={!name.trim() || createProject.isPending}>
                {createProject.isPending ? 'Creando...' : 'Crear proyecto'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
