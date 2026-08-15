import { TMDBMovie } from "../types/tmdb";

export class TMDBService {
	private apiKey: string
	private baseUrl = 'https://api.themoviedb.org/3'

	constructor() {
		this.apiKey = process.env.TMDB_API_KEY || ''
	}

	private async request<T>(endpoint: string, queryParams = ''): Promise<T> {
		if (!this.apiKey || this.apiKey === 'cole_sua_api_key_do_tmdb_aqui') {
			return this.getMockData(endpoint) as T;
		}

    const url = `${this.baseUrl}${endpoint}?api_key=${this.apiKey}&language=pt-BR${queryParams}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Erro na integração com TMDb: ${response.statusText}`)
    }

    return response.json() as Promise<T>
	}

  async getPopularMovies(): Promise<TMDBMovie[]> {
    const data = await this.request<{ results: TMDBMovie[] }>('movie/popular')
    return data.results
  }

  async searchMovies(query: string): Promise<TMDBMovie[]> {
    const encodedQuery = encodeURIComponent(query)
    const data = await this.request<{ results: TMDBMovie[] }>('/search/movie', `&query=${encodedQuery}`)
    return data.results
  }
  
  private getMockData(endpoint: string): any {
    const mockMovies = [
      {
        id: 101,
        title: "Matrix: The Developer Code",
        overview: "Um programador sênior descobre que o TypeScript que ele programa é na verdade uma simulação realista.",
        poster_path: null,
        release_date: "2026-08-14"
      },
      {
        id: 102,
        title: "Prisma 7: A Revolução do Rust-Free",
        overview: "A emocionante jornada de um banco de dados que se libertou dos motores pesados para rodar de forma ultra-rápida no Edge.",
        poster_path: null,
        release_date: "2026-05-10"
      }
    ];

    if (endpoint.includes('/search/movie')) {
      return { results: mockMovies };
    }
    return { results: mockMovies };
  }
}