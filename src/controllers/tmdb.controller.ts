import { Request, Response } from "express";
import { ITMDBService } from "../interfaces/tmdb-service.interface";

export class TMDBController {
  constructor(private tmdbService: ITMDBService) { }

	async getPopular(req: Request, res: Response) {
		try {
      const movies = await this.tmdbService.getPopularMovies()
      return res.status(200).json(movies)
    } catch (error: any) {
      return res.status(500).json({ error: 'Falha ao conectar com o catálogo de filmes.' })
    }
	}

  async search(req: Request, res: Response) {
    try {
      const { query } = req.query

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'O parâmetro "query" é obrigatório e dev ser uma string.' })
      }

      const movies = await this.tmdbService.searchMovies(query)
      return res.status(200).json(movies)
    } catch (error: any) {
      return res.status(500).json({ error: 'Falha ao pesquisar no catálogo de filmes.' })
    }
  }
}