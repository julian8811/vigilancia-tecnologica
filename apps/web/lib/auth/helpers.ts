import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@vt/database'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const { userId } = auth()
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      workspaceMembers: {
        include: { workspace: true },
      },
    },
  })

  return user
}

export async function requireUser() {
  const { userId } = auth()

  // Not authenticated with Clerk at all → send to login
  if (!userId) redirect('/login')

  const user = await getCurrentUser()

  // Authenticated with Clerk but no DB record yet (webhook pending or first-time sync)
  // Redirecting to /login here causes an infinite loop because Clerk will redirect
  // the already-authenticated user back to /dashboard.
  // Instead redirect to an onboarding/sync page, or throw a meaningful error.
  if (!user) redirect('/onboarding')

  return user
}

export async function requireRole(
  workspaceId: string,
  minimumRole: 'viewer' | 'consultant' | 'researcher' | 'analyst' | 'admin'
) {
  const user = await requireUser()
  const member = user.workspaceMembers.find((m) => m.workspaceId === workspaceId)

  if (!member) redirect('/dashboard')

  const roleHierarchy = { viewer: 0, consultant: 1, researcher: 2, analyst: 3, admin: 4 }
  if (roleHierarchy[member.role] < roleHierarchy[minimumRole]) {
    redirect('/dashboard')
  }

  return { user, member }
}
