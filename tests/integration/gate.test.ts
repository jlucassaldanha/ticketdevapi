import { Role, TicketStatus } from '@prisma/client';
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import { resetDb } from '../helpers/reset-db';
import { prisma } from '../../src/config/database';

describe('Módulo de Portaria (Integration)', () => {
  let staffToken: string
  let eventAId: string
  let eventBId: string
  let validTicketHash: string
  let client1Id: string

  beforeEach(async () => {
    await resetDb()

    await request(app).post('/api/auth/register').send({
      name: 'Staff Portaria',
      email: 'staff@email.com',
      password: 'senhaSegura123',
      role: Role.ORGANIZER,
    })

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'staff@email.com',
      password: 'senhaSegura123',
    })
    staffToken = loginRes.body.token

    const eventARes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        externalId: 'EXT-EVENT-A',
        date: new Date().toISOString(),
        location: 'Local A',
        capacity: 100,
        price: 50.00,
        title: 'Evento A',
        category: 'Teste',
      })

    eventAId = eventARes.body.id

    const eventBRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        externalId: 'EXT-EVENT-B',
        date: new Date().toISOString(),
        location: 'Local B',
        capacity: 100,
        price: 50.00,
        title: 'Evento B',
        category: 'Teste',
      })

    eventBId = eventBRes.body.id

    const client = await prisma.user.create({
      data: {
        name: 'Comprador Teste',
        email: 'comprador@email.com',
        password: 'hash',
        role: Role.CONSUMER,
      },
    })

    client1Id = client.id

    const ticket = await prisma.ticket.create({
      data: {
        eventId: eventAId,
        clientId: client1Id,
        seatNumber: 'A01',
        status: TicketStatus.ACTIVE,
        secureHash: 'hash-valido-evento-a-12345',
      },
    })
    validTicketHash = ticket.secureHash
  })

  describe('POST /api/gate/validate', () => {
    it('deve validar o ingresso com sucesso e retornar 200', async () => {
      const response = await request(app)
        .post('/api/gate/validate')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          secureHash: validTicketHash,
          currentEventId: eventAId,
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status')
      expect(response.body.status).toBe('VALID')
      const ticketInDb = await prisma.ticket.findUnique({
        where: { secureHash: validTicketHash },
      })
      expect(ticketInDb?.status).toBe(TicketStatus.USED)
    })

    it('deve recusar se faltar hash do ingresso ou Id do evento', async () => {
      const response = await request(app)
        .post('/api/gate/validate')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          secureHash: validTicketHash,
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('O hash do ingresso e o ID do evento são obrigatórios.')
    })

    it('deve retornar 404 para um hash de ingresso inexistente', async () => {
      const response = await request(app)
        .post('/api/gate/validate')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          secureHash: "hash-que-nao-existe",
          currentEventId: eventAId,
        })

      expect(response.status).toBe(404)
      expect(response.body.status).toBe('INVALID')
      expect(response.body.message).toBe('Ingresso inválid ou assinatura digital não reconhecida no servidor.')
    })

    it('deve retornar 400 ao tentar usar ingresso do Evento A na portaria do Evento B', async () => {
      const response = await request(app)
        .post('/api/gate/validate')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          secureHash: validTicketHash,
          currentEventId: eventBId,
        })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('WRONG_EVENT')
      expect(response.body.message).toContain('Ingresso não pertence a este evento! Este ingresso é válido apenas para o evento:')
    })

    it('deve retornar 409 ao tentar reutilizar um ingresso que já deu entrada', async () => {
      await prisma.ticket.update({
        where: { secureHash: validTicketHash },
        data: { status: TicketStatus.USED },
      })

      const response = await request(app)
        .post('/api/gate/validate')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          secureHash: validTicketHash,
          currentEventId: eventAId,
        })

      expect(response.status).toBe(409)
      expect(response.body.status).toBe('ALREADY_USED')
      expect(response.body.message).toBe('Atenção! Este ingresso já foi validado e utilizado para entrada na portaria anteriormente.')
    })
  })
})