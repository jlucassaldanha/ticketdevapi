import { TMDBMovie } from "../types/tmdb.js"

export interface ITMDBService {
  getPopularMovies(): Promise<TMDBMovie[]>
  searchMovies(query: string): Promise<TMDBMovie[]>
  getMovieById(id: number): Promise<TMDBMovie>
}