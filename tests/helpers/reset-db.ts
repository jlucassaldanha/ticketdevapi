import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

export async function resetDb() {
  await prisma.ticket.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()
}