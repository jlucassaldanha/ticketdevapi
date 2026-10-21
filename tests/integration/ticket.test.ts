import { PrismaClient, Role } from '@prisma/client';
import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from '../helpers/reset-db';

const prisma = new PrismaClient()

describe('Fluxo de Ingressos (Tickets)', () => {
  let userId: string
  let eventId: string

  beforeEach(async () => {
    await resetDb()

    const user = await prisma.user.create({
      data: {
        name: 'Organizador Teste',
        email: 'org@teste.com',
        password: 'hash',
        role: Role.ORGANIZER
      }
    })
  })
})