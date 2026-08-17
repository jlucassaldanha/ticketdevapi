export interface TMDBMovie {
	id: number
	title: string
	overview: string
	poster_path: string | null
	release_date: string
	genre_ids: number[]
}