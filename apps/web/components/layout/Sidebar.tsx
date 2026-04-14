'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FolderOpen,
  Search,
  BarChart3,
  FileText,
  Bell,
  Settings,
  Shield,
  BookMarked,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Proyectos', icon: FolderOpen },
  { href: '/collections', label: 'Colecciones', icon: BookMarked },
  { href: '/reports', label: 'Informes', icon: FileText },
  { href: '/alerts', label: 'Alertas', icon: Bell },
  { href: '/settings', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 max-md:hidden max-md:w-16 max-md:overflow-hidden">
      <div className="p-6 border-b border-border max-md:p-3">
        <h1 className="text-sm font-bold text-foreground tracking-tight max-md:hidden">
          Vigilancia
          <br />
          <span className="text-primary">Tecnológica</span>
        </h1>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 max-md:px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                'max-md:justify-center max-md:px-2'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="max-md:hidden">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
