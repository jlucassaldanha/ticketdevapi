import { Role, TicketStatus } from '@prisma/client';
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import { resetDb } from '../helpers/reset-db';
import { prisma } from '../../src/config/database';

describe('Módulo de Ingressos (Integration)', () => {
  let organizerToken: string
  let client1Token: string
  let client1Id: string
  let client2Token: string
  let eventId: string

  beforeEach(async () => {
    await resetDb()

    await request(app).post('/api/auth/register').send({
      name: 'Org Evento',
      email: 'org@email.com',
      password: 'senhaTeste',
      role: Role.ORGANIZER,
    })

    const orgLogin = await request(app).post('/api/auth/login').send({
      email: 'org@email.com',
      password: 'senhaTeste',
    })

    organizerToken = orgLogin.body.token

    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        externalId: 'EXT-TICKET-TEST',
        date: new Date().toISOString(),
        location: 'Local Teste',
        capacity: 100,
        price: 25.00,
        title: 'Local Teste',
        category: 'Teste',
      });

    eventId = eventRes.body.id

    await request(app).post('/api/auth/register').send({
      name: 'Cliente Um',
      email: 'cliente1@email.com',
      password: 'senhaTeste',
      role: Role.CONSUMER,
    })

    const client1Login = await request(app).post('/api/auth/login').send({
      email: 'cliente1@email.com',
      password: 'senhaTeste',
    })

    client1Token = client1Login.body.token

    const user1 = await prisma.user.findUnique({ where: { email: 'cliente1@email.com' } })
    client1Id = user1!.id

    await request(app).post('/api/auth/register').send({
      name: 'Cliente Dois',
      email: 'cliente2@email.com',
      password: 'senhaTeste',
      role: Role.CONSUMER,
    })

    const client2Login = await request(app).post('/api/auth/login').send({
      email: 'cliente2@email.com',
      password: 'senhaTeste',
    })

    client2Token = client2Login.body.token
  })

  describe('POST /api/tickets/reserve (reserva e pagamento)', () => {
    it('deve reserver e pagar um ingresso com sucesso', async () => {
      const response = await request(app)
        .post('/api/tickets/reserve')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          eventId,
          seatNumber: 'A10',
          paymentMethod: 'CREDIT_CARD',
          paymentSimulatedStatus: 'APPROVED',
        })

      expect(response.status).toBe(201)
      expect(response.body.message).toBe('Ingresso reservado e pago com sucesso!')
      expect(response.body).toHaveProperty('ticket')
      expect(response.body.ticket).toHaveProperty('id')
      expect(response.body.ticket.seatNumber).toBe('A10')
      expect(response.body.ticket.clientId).toBe(client1Id)
    })

    it('deve recusar a reserva se faltar Id do evento ou método de pagamento', async () => {
      const response = await request(app)
        .post('/api/tickets/reserve')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          seatNumber: 'A10',
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('O ID do evento e metodo de pagamento são obrigatórios.')
      expect(response.body).not.toHaveProperty('ticket')
    })

    it('deve recusar a reserva sem token de autenticação', async () => {
      const response = await request(app)
        .post('/api/tickets/reserve')
        .send({
          eventId,
          seatNumber: 'A10',
          paymentMethod: 'CREDIT_CARD',
        })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Token de autenticação não fornecido.')
    })

    it('deve retornar 409 ao tentar reservar um assento já reservado', async () => {
      await request(app)
        .post('/api/tickets/reserve')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          eventId,
          seatNumber: 'A10',
          paymentMethod: 'CREDIT_CARD',
          paymentSimulatedStatus: 'APPROVED',
        })

      const response = await request(app)
        .post('/api/tickets/reserve')
        .set('Authorization', `Bearer ${client2Token}`)
        .send({
          eventId,
          seatNumber: 'A10',
          paymentMethod: 'CREDIT_CARD',
        })

      expect(response.status).toBe(409)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Este assento já foi reservado por outro cliente. Por favor, escolha outro assento.')
    })

    it('deve retornar 402 quanto o pagamento for recusado', async () => {
      const response = await request(app)
        .post('/api/tickets/reserve')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          eventId,
          seatNumber: 'B10',
          paymentMethod: 'CREDIT_CARD',
          paymentSimulateStatus: 'REFUSED', 
        })

      expect(response.status).toBe(402)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('A operadora financeira recusou a transação. Verifique os dados do cartão de crédito simulado.')
    })
  })

  describe('GET /api/tickets/my-tickets', () => {
    it('deve listar apenas os ingressos pertencentes ao cliente autenticado', async () => {
      await request(app)
        .post('/api/tickets/reserve')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          eventId,
          seatNumber: 'A10',
          paymentMethod: 'CREDIT_CARD',
          paymentSimulateStatus: 'APPROVED', 
        })

      await request(app)
        .post('/api/tickets/reserve')
        .set('Authorization', `Bearer ${client2Token}`)
        .send({
          eventId,
          seatNumber: 'B10',
          paymentMethod: 'CREDIT_CARD',
          paymentSimulateStatus: 'APPROVED', 
        })

      const response = await request(app)
        .get('/api/tickets/my-tickets')
        .set('Authorization', `Bearer ${client1Token}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].clientId).toBe(client1Id)
    })
  })

  describe('GET /api/tickets/share/:secureHash', () => {
    it('deve localizar um ingresso publicamente usando o secureHash', async () => {
      const reserveRes = await request(app)
        .post('/api/tickets/reserve')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          eventId,
          seatNumber: 'A10',
          paymentMethod: 'CREDIT_CARD',
          paymentSimulateStatus: 'APPROVED', 
        })
      
      const hash = reserveRes.body.ticket.secureHash

      const response = await request(app).get(`/api/tickets/share/${hash}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Ingresso localizado com sucesso!')
      expect(response.body.ticket.eventId).toBe(eventId)
      expect(response.body.ticket.seatNumber).toBe('A10')
    })

    it('deve retornar 404 se o secureHash for inválido ou inexistente', async () => {
      const response = await request(app).get('/api/tickets/share/hash-inexistente-12345')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Ingresso inválido ou inexistente.')
    })
  })

  describe('POST /api/tickets/:id/cancel', () => {
    it('deve permitir que o dono do ingresso cancele', async () => {
      const reserveRes = await request(app)
        .post('/api/tickets/reserve')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          eventId,
          seatNumber: 'A10',
          paymentMethod: 'CREDIT_CARD',
          paymentSimulateStatus: 'APPROVED', 
        })
      
      const ticketId = reserveRes.body.ticket.id

      const cancelRes = await request(app)
        .post(`/api/tickets/${ticketId}/cancel`)
        .set('Authorization', `Bearer ${client1Token}`)

      const ticketRes = await request(app)
        .get('/api/tickets/my-tickets')
        .set('Authorization', `Bearer ${client1Token}`)

      expect(cancelRes.status).toBe(200)
      expect(cancelRes.body.message).toBe('Ingresso cancelado com sucesso e vaga devolvida ao estoque!')
      expect(ticketRes.body).toHaveLength(1)
      expect(ticketRes.body[0].status).toBe('CANCELLED')
    })

    it('deve impedir que um cliente cancele o ingresso de outro cliente', async () => {
      const reserveRes = await request(app)
        .post('/api/tickets/reserve')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          eventId,
          seatNumber: 'A10',
          paymentMethod: 'CREDIT_CARD',
          paymentSimulateStatus: 'APPROVED', 
        })
      
      const ticketId = reserveRes.body.ticket.id

      const cancelRes = await request(app)
        .post(`/api/tickets/${ticketId}/cancel`)
        .set('Authorization', `Bearer ${client2Token}`)

      const ticketRes = await request(app)
        .get('/api/tickets/my-tickets')
        .set('Authorization', `Bearer ${client1Token}`)

      expect(cancelRes.status).toBe(403)
      expect(cancelRes.body.error).toBe('Você não tem autorização para cancelar este ingresso.')
      expect(ticketRes.body).toHaveLength(1)
      expect(ticketRes.body[0].status).toBe('ACTIVE')
    })

    it('deve retornar 400 ao tentar cancelar um ingresso já cancelado', async () => {
      const reserveRes = await request(app)
        .post('/api/tickets/reserve')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          eventId,
          seatNumber: 'A10',
          paymentMethod: 'CREDIT_CARD',
          paymentSimulateStatus: 'APPROVED', 
        })
      
      const ticketId = reserveRes.body.ticket.id

      await request(app)
        .post(`/api/tickets/${ticketId}/cancel`)
        .set('Authorization', `Bearer ${client1Token}`)

      const cancelRes = await request(app)
        .post(`/api/tickets/${ticketId}/cancel`)
        .set('Authorization', `Bearer ${client1Token}`)

      expect(cancelRes.status).toBe(400)
      expect(cancelRes.body.error).toBe('Este ingresso já se encontra cancelado.')
    })

    it('deve retornar 400 ao tentar cancelar um ingresso que já foi utilizado', async () => {
      const reserveRes = await request(app)
        .post('/api/tickets/reserve')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          eventId,
          seatNumber: 'A10',
          paymentMethod: 'CREDIT_CARD',
          paymentSimulateStatus: 'APPROVED', 
        })

      const ticketId = reserveRes.body.ticket.id

      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.USED },
      });

      const cancelRes = await request(app)
        .post(`/api/tickets/${ticketId}/cancel`)
        .set('Authorization', `Bearer ${client1Token}`)

      expect(cancelRes.status).toBe(400)
      expect(cancelRes.body).toHaveProperty('error')
      expect(cancelRes.body.error).toBe('Não é possível cancelar um ingresso que já foi utilizado.')
    })
  })
})