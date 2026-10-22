import { prisma } from '../../src/config/database'

export async function resetDb() {
  await prisma.ticket.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()
}