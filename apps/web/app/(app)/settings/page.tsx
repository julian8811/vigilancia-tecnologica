import { requireUser } from '@/lib/auth/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserButton } from '@clerk/nextjs'

export default async function SettingsPage() {
  const user = await requireUser()

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">Tu perfil y preferencias</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <UserButton />
            <div>
              <p className="font-medium text-sm">{user.fullName || 'Sin nombre'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Gestioná tu cuenta, contraseña y métodos de inicio de sesión desde el panel de usuario de Clerk (ícono de arriba).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace</CardTitle>
        </CardHeader>
        <CardContent>
          {user.workspaceMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-medium">{member.workspace.name}</p>
                <p className="text-xs text-muted-foreground">/{member.workspace.slug}</p>
              </div>
              <span className="text-xs border border-border rounded px-2 py-0.5 capitalize">{member.role}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
