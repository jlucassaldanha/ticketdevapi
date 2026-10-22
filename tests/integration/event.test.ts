import { Role, TicketStatus } from '@prisma/client';
import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from '../helpers/reset-db';
import request from 'supertest'
import { app } from '../../src/index'
import { prisma } from '../../src/config/database';

describe('Módulo de Eventos (Integration)', () => {
  let organizer1Token: string
  let organizer1Id: string
  let organizer2Token: string

  beforeEach(async () => {
    await resetDb()

    const regRes1 = await request(app).post('/api/auth/register').send({
      name: 'Org Um',
      email: 'org1@email.com',
      password: 'senhaTeste',
      role: Role.ORGANIZER
    })

    expect(regRes1.status).toBe(201)

    const loginRes1 = await request(app).post('/api/auth/login').send({
      email: 'org1@email.com',
      password: 'senhaTeste'
    })

    organizer1Token = loginRes1.body.token
    const user1 = await prisma.user.findUnique({ where: { email: 'org1@email.com' } })
    organizer1Id = user1!.id

    const regRes2 = await request(app).post('/api/auth/register').send({
      name: 'Org Dois',
      email: 'org2@email.com',
      password: 'senhaTeste',
      role: Role.ORGANIZER
    })

    expect(regRes2.status).toBe(201)

    const loginRes2 = await request(app).post('/api/auth/login').send({
      email: 'org2@email.com',
      password: 'senhaTeste'
    })

    organizer2Token = loginRes2.body.token
  })

  describe('POST /api/events', () => {
    it('deve criar um evento com sucesso quando o roganizador esta autenticado', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizer1Token}`)
        .send({
          externalId: 'EXT-100',
          date: new Date().toISOString(),
          location: 'Localização Teste',
          capacity: 100,
          price: 25.00,
          title: 'Evento Teste',
          category: 'Teste'
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body.organizerId).toBe(organizer1Id)
    })

    it('deve recusar a criação de evento se faltar um campo obrigatório', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizer1Token}`)
        .send({
          location: 'Localização Teste',
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Campos obrigatórios ausentes.')
    })

    it('deve recusar a criação de evento sem token de autenticação', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          externalId: 'EXT-100',
          date: new Date().toISOString(),
          location: 'Localização Teste',
          capacity: 100,
          price: 25.00,
          title: 'Evento Teste',
          category: 'Teste'
        })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Token de autenticação não fornecido.')
    })
  })

  describe('GET /api/events/my-events', () => {
    it('deve listar apenas os eventos pertencentes ao organizador logado', async () => {
      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizer1Token}`)
        .send({
          externalId: 'EXT-100',
          date: new Date().toISOString(),
          location: 'Localização Teste 1',
          capacity: 100,
          price: 25.00,
          title: 'Evento Teste 1',
          category: 'Teste 1'
        })

      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizer2Token}`)
        .send({
          externalId: 'EXT-200',
          date: new Date().toISOString(),
          location: 'Localização Teste 2',
          capacity: 100,
          price: 25.00,
          title: 'Evento Teste 2',
          category: 'Teste 2'
        })

      const response = await request(app)
        .get('/api/events/my-events')
        .set('Authorization', `Bearer ${organizer1Token}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].organizerId).toBe(organizer1Id)
    })
  })

  describe('PUT /api/events/:id', () => {
    it('deve permitir que o organizador dono do evento o atualize', async () => {
      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizer1Token}`)
        .send({
          externalId: 'EXT-EDIT',
          date: new Date().toISOString(),
          location: 'Local Antigo',
          capacity: 100,
          price: 50.00,
          title: 'Título Antigo',
          category: 'Teste',
        });
      
      const eventId = createRes.body.id

      const updateRes = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${organizer1Token}`)
        .send({
          location: 'Novo Local',
          price: 25.00
        })

      const eventsRes = await request(app)
        .get('/api/events/my-events')
        .set('Authorization', `Bearer ${organizer1Token}`)

      expect(updateRes.status).toBe(200)
      expect(updateRes.body).toHaveProperty('message')
      expect(updateRes.body.message).toBe('Evento atualizado com sucesso!')
      expect(eventsRes.body[0].location).toBe('Novo Local')
      expect(Number(eventsRes.body[0].price)).toBe(25.00)
    })

    it('deve proibir que o organizador edite um evento de outro organizador', async () => {
      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizer1Token}`)
        .send({
          externalId: 'EXT-EDIT',
          date: new Date().toISOString(),
          location: 'Local Antigo',
          capacity: 100,
          price: 50.00,
          title: 'Título Antigo',
          category: 'Teste',
        });
      
      const eventId = createRes.body.id

      const updateRes = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${organizer2Token}`)
        .send({
          location: 'Novo Local',
        })

      const eventsRes = await request(app)
        .get('/api/events/my-events')
        .set('Authorization', `Bearer ${organizer1Token}`)

      expect(updateRes.status).toBe(403);
      expect(updateRes.body).toHaveProperty('error')
      expect(updateRes.body.error).toBe('Você não tem permissão para editar eventos de outros organizadores.')
      expect(eventsRes.body[0].location).not.toBe('Novo Local')
    })

    it('deve retornar 404 ao tentar atualizar um evento que não existe', async () => {
      const response = await request(app)
        .put('/api/events/1-2-3')
        .set('Authorization', `Bearer ${organizer1Token}`)
        .send({
          location: 'Novo Local',
        })

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Evento não localizado para atualização.')
    })
  })

  describe('DELETE /api/events/:id', () => {
    it('deve excluir com sucesso um evento sem ingressos vendidos', async () => {
      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizer1Token}`)
        .send({
          externalId: 'EXT-DELETE',
          date: new Date().toISOString(),
          location: 'Local Deletar',
          capacity: 50,
          price: 25.00,
          title: 'Evento para deletar',
          category: 'Teste',
        })

      const eventId = createRes.body.id

      const deleteRes = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${organizer1Token}`)

      const eventsRes = await request(app)
        .get('/api/events/my-events')
        .set('Authorization', `Bearer ${organizer1Token}`)

      expect(deleteRes.status).toBe(200)
      expect(deleteRes.body).toHaveProperty('message')
      expect(deleteRes.body.message).toBe('Evento excluído com sucesso!')
      expect(eventsRes.body).toHaveLength(0)
    })

    it('não deve permitir excluir um evento com ingressos vendidos', async () => {
      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizer1Token}`)
        .send({
          externalId: 'EXT-COM-INGRESSO',
          date: new Date().toISOString(),
          location: 'Teste',
          capacity: 100,
          price: 25.00,
          title: 'Evento Teste',
          category: 'Teste',
        })

      const eventId = createRes.body.id

      const client = await prisma.user.create({
        data: {
          name: 'Comprador Teste',
          email: 'comprador@teste.com',
          password: 'hash',
          role: Role.CONSUMER,
        },
      })

      await prisma.ticket.create({
        data: {
          eventId,
          clientId: client.id,
          seatNumber: 'A1',
          status: TicketStatus.ACTIVE,
          secureHash: 'hash-ingresso-123',
        },
      })

      const deleteRes = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${organizer1Token}`)

      const eventsRes = await request(app)
        .get('/api/events/my-events')
        .set('Authorization', `Bearer ${organizer1Token}`)

      expect(deleteRes.status).toBe(400)
      expect(deleteRes.body).toHaveProperty('error')
      expect(deleteRes.body.error).toBe('Não é possível excluir um evento que já possui ingressos vendidos.')
      expect(eventsRes.body).toHaveLength(1)
    })

    it('deve proibir que um organizador exclua o evento de outro organizador', async () => {
      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizer1Token}`)
        .send({
          externalId: 'EXT-COM-INGRESSO',
          date: new Date().toISOString(),
          location: 'Teste',
          capacity: 100,
          price: 25.00,
          title: 'Evento Teste',
          category: 'Teste',
        })

      const eventId = createRes.body.id

      const deleteRes = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${organizer2Token}`);

      const eventsRes = await request(app)
        .get('/api/events/my-events')
        .set('Authorization', `Bearer ${organizer1Token}`)

      expect(deleteRes.status).toBe(403)
      expect(deleteRes.body).toHaveProperty('error')
      expect(deleteRes.body.error).toBe('Você não tem permissão para excluir eventos de outros organizadores.')
      expect(eventsRes.body).toHaveLength(1)
    })
  })
})