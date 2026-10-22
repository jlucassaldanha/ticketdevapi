import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import { app } from '../../src/index'
import { TMDBService } from '../../src/services/tmdb.service'

describe('Módulo TMDB (Integration)', () => {
  describe('GET /api/catalog/popular', () => {
    it('deve retornar a lista de filmes populares com sucesso (200)', async () => {
      vi.spyOn(TMDBService.prototype, 'getPopularMovies').mockResolvedValueOnce([
        { id: 101, title: 'Filme Popular 1', overview: 'Sinopse 1' },
        { id: 102, title: 'Filme Popular 2', overview: 'Sinopse 2' },
      ] as any)

      const response = await request(app).get('/api/catalog/popular')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(2)
      expect(response.body[0].title).toBe('Filme Popular 1')
    })

    it('deve retornar 500 caso o serviço do TMDB falhe na conexão', async () => {
      vi.spyOn(TMDBService.prototype, 'getPopularMovies').mockRejectedValueOnce(
        new Error('TMDB_CONNECTION_ERROR')
      )

      const response = await request(app).get('/api/catalog/popular')

      expect(response.status).toBe(500)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Erro interno no servidor. Falha ao conectar com o catálogo de filmes.')
    })
  })

  describe('GET /api/catalog/search', () => {
    it('deve pesquisar filmes com sucesso quando o parâmetro query é enviado', async () => {
      vi.spyOn(TMDBService.prototype, 'searchMovies').mockResolvedValueOnce([
        { id: 201, title: 'Batman Begins' },
      ] as any)

      const response = await request(app)
        .get('/api/catalog/search')
        .query({ query: 'Batman' })

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body[0].title).toBe('Batman Begins')
    })

    it('deve recusar a pesquisa se o parâmetro query não for informado', async () => {
      const response = await request(app).get('/api/catalog/search')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('O parâmetro "query" é obrigatório e dev ser uma string.')
    })
  })
})