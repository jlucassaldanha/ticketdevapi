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

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    if (!organizerId) {
      throw new Error('ORGANIZER_ID_REQUIRED')
    }

    return this.eventRepository.findByOrganizerId(organizerId)
  }

  async listEvents(): Promise<Event[]> {
    return this.eventRepository.findAll()
  }

  async updateEvent(id: string, organizerId: string, data: Partial<Event>): Promise<Event> {
    const event = await this.eventRepository.findById(id)
    if (!event) {
      throw new Error('EVENT_NOT_FOUND')
    }

    if (event.organizerId !== organizerId) {
      throw new Error('UNAUTHORIZED_EVENT_ACCESS');
    }

    return this.eventRepository.update(id, data)
  }

  async deleteEvent(id: string, organizerId: string): Promise<Event> {
    const event = await this.eventRepository.findById(id)
    if (!event) {
      throw new Error('EVENT_NOT_FOUND')
    }

    if (event.organizerId !== organizerId) {
      throw new Error('UNAUTHORIZED_EVENT_ACCESS');
    }

    if (event.ticketsSold > 0) {
      throw new Error('EVENT_HAS_SOLD_TICKETS')
    }

    return this.eventRepository.delete(id)
  }
}