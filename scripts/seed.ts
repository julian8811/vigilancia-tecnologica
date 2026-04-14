import { prisma } from '../packages/database/src'

async function seed() {
  console.log('Seeding database...')

  // This runs after Clerk creates the user via webhook
  // Just verify connection works
  const userCount = await prisma.user.count()
  console.log(`Current users: ${userCount}`)

  console.log('Seed complete')
  await prisma.$disconnect()
}

seed().catch(console.error)
