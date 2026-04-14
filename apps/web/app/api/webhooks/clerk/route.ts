import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/db'

// Force dynamic to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }

  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }

  const { type: eventType, data } = evt

  if (eventType === 'user.created') {
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = data
    const email = email_addresses[0]?.email_address
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || null

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          clerkId,
          email: email!,
          fullName,
          avatarUrl: image_url || null,
        },
      })

      const slug = email!.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')

      const workspace = await tx.workspace.create({
        data: {
          name: fullName ? `Workspace de ${fullName}` : `Mi Workspace`,
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
  }

  if (eventType === 'user.updated') {
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = data
    const email = email_addresses[0]?.email_address
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || null

    await prisma.user.update({
      where: { clerkId },
      data: {
        email: email!,
        fullName,
        avatarUrl: image_url || null,
      },
    })
  }

  if (eventType === 'user.deleted') {
    const { id: clerkId } = data
    if (clerkId) {
      await prisma.user.delete({ where: { clerkId } })
    }
  }

  return new Response('OK', { status: 200 })
}
