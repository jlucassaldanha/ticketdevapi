import { Role } from '@prisma/client';
import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from '../helpers/reset-db';
import request from 'supertest'
import { app } from '../../src/index'

describe('Módulo de Autenticação (Integration)', () => {
  beforeEach(async () => {
    await resetDb()
  })

  describe('POST /api/auth/register', () => {
    it('deve cadastrar um novo usuário com sucesso e retornar 201', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User Teste',
          email: 'email@teste.com',
          password: 'senhaTeste',
          role: Role.CONSUMER
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body.email).toBe('email@teste.com')
      expect(response.body.name).toBe('User Teste')
      expect(response.body).not.toHaveProperty('password')
    })

    it('não deve permitir o cadastro de e-mail duplicado e deve retornar 400', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User Teste',
          email: 'email@teste.com',
          password: 'senhaTeste',
          role: Role.CONSUMER
        })

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Outro Teste',
          email: 'email@teste.com',
          password: 'outraSenhaTeste',
          role: Role.CONSUMER
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Este e-mail já está em uso.')
    })

    it('deve recusar cadastro com cargo inválido', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User Teste',
          email: 'email@teste.com',
          password: 'senhaTeste',
          role: 'Cliente'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Cargo inválido.')
    })

    it('deve recusar cadastro com campos faltando', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'email@teste.com',
          password: 'senhaTeste',
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Todos os campos são obrigatórios.')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Usuario Valido',
        email: 'valido@email.com',
        password: 'senhaValida',
        role: Role.CONSUMER
      })
    })

    it('deve autenticar o usuario e retornar o token JWT', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'valido@email.com',
          password: 'senhaValida'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('token')
      expect(typeof response.body.token).toBe('string')
    })

    it('deve recusar o login com senha incorreta e retornar 401', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'valido@email.com',
          password: 'senhaErrada'
        })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Credenciais inválidas.')
    })

    it('deve recusar o login para usuário não cadastrado', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@email.com',
          password: 'senhaNaoExiste'
        })

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Usuário não encontrado.')
    })
  })
})