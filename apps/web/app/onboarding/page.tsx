import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@vt/database'

/**
 * Onboarding page — reached when a user is authenticated with Clerk but has
 * no corresponding record in the database (webhook delivery lag or failure).
 * Creates the DB record on-demand and redirects to dashboard.
 */
export default async function OnboardingPage() {
  const { userId } = auth()

  // Not authenticated at all → send to login
  if (!userId) redirect('/login')

  // Check if user already exists in DB (race condition: webhook arrived while loading)
  const existing = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (existing) redirect('/dashboard')

  // Fetch full Clerk profile to create the DB record
  const clerkUser = await currentUser()
  if (!clerkUser) redirect('/login')

  const email = clerkUser.emailAddresses[0]?.emailAddress
  if (!email) {
    // Should not happen, but guard anyway
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p>No se pudo obtener el correo electrónico de tu cuenta. Contactá soporte.</p>
      </div>
    )
  }

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        clerkId: userId,
        email,
        fullName,
        avatarUrl: clerkUser.imageUrl || null,
      },
    })

    const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')

    const workspace = await tx.workspace.create({
      data: {
        name: fullName ? `Workspace de ${fullName}` : 'Mi Workspace',
        slug: `${slug}-${Date.now()}`,
        createdBy: user.id,
      },
    })

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'admin',
      },
    })
  })

  redirect('/dashboard')
}
