import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { initializeIndexes } from '@/lib/search/meilisearch'

// Force dynamic to prevent build-time initialization
export const dynamic = 'force-dynamic'

export async function POST() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initializeIndexes()
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
