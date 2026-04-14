import { UserButton } from '@clerk/nextjs'

export function Topbar() {
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Workspace switcher placeholder */}
      </div>
      <div className="flex items-center gap-3">
        <UserButton afterSignOutUrl="/login" />
      </div>
    </header>
  )
}
