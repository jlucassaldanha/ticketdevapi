import { Event } from "@prisma/client";
import { IEventRepository } from "../interfaces/event-repository.interface";
import { IEventService } from "../interfaces/event-service.interface";
import { ITMDBService } from "../interfaces/tmdb-service.interface";
import { CreateEventInput } from "../types/event";

export class EventService implements IEventService {
  constructor(
    private eventRepository: IEventRepository,
    private tmdbService: ITMDBService
  ) {}

  async createEvent(organizerId: string, input: CreateEventInput): Promise<Event> {
    const moveId = parseInt(input.externalId, 10)
    const movieDetails = await this.tmdbService.getMovieById(moveId)

    return this.eventRepository.create({
      title: movieDetails.title,
      description: movieDetails.overview,
      imageUrl: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : null,
      externalId: input.externalId,
      category: 'MOVIE',
      date: new Date(input.date),
      location: input.location,
      capacity: input.capacity,
      price: input.price,
      organizerId
    })
  }

  async listEvents(): Promise<Event[]> {
    return this.eventRepository.findAll()
  }
}