import { ITMDBService } from "../interfaces/tmdb-service.interface";
import { TMDBMovie } from "../types/tmdb";

export class TMDBService implements ITMDBService {
	private apiKey: string
	private baseUrl = 'https://api.themoviedb.org/3'

	constructor() {
		this.apiKey = process.env.TMDB_API_KEY || ''
	}

  async getPopularMovies(): Promise<TMDBMovie[]> {
    if (!this.apiKey || this.apiKey === 'cole_sua_api_key_do_tmdb_aqui') {
			return this.getMockData();
		}

    const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=pt-BR`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Erro na integração com TMDb: ${response.statusText}`)
    }

    const data = await response.json() as { results: TMDBMovie[] }
    return data.results
  }

  async searchMovies(query: string): Promise<TMDBMovie[]> {
    if (!this.apiKey || this.apiKey === 'cole_sua_api_key_do_tmdb_aqui') {
			return this.getMockData();
		}

    const encodedQuery = encodeURIComponent(query)
    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=pt-BR&query=${encodedQuery}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Erro ao buscar filme no TMDb: ${response.statusText}`)
    }

    const data = await response.json() as { results: TMDBMovie[] }
    return data.results
  }
  
  private getMockData(): TMDBMovie[] {
    return [
      {
        id: 101,
        title: "Matrix: The Developer Code",
        overview: "Um programador sênior descobre que o TypeScript que ele programa é na verdade uma simulação realista.",
        poster_path: null,
        release_date: "2026-08-14",
        genre_ids: []
      },
      {
        id: 102,
        title: "Prisma 7: A Revolução do Rust-Free",
        overview: "A emocionante jornada de um banco de dados que se libertou dos motores pesados para rodar de forma ultra-rápida no Edge.",
        poster_path: null,
        release_date: "2026-05-10",
        genre_ids: []
      }
    ];
  }
}