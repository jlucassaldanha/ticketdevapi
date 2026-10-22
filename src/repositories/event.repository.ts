import { Event } from "@prisma/client";
import { IEventRepository } from "../interfaces/event-repository.interface";
import { CreateEventData } from "../types/event";
import { prisma } from "../config/database";

export class EventRepository implements IEventRepository {
  private mapEventWithTicketsSold(event: any): Event {
    const { _count, ...eventData } = event
    return {
      ...eventData,
      ticketsSold: _count?.tickets ?? 0
    }
  }

  async create(data: CreateEventData): Promise<Event> {
    return prisma.event.create({ data })
  }

  async findByOrganizerId(organizerId: string): Promise<Event[]> {
    const events = await prisma.event.findMany({
      where: {
        organizerId: organizerId,
      },
      include: {
        _count: {
          select: { tickets: true }
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return events.map((event) => this.mapEventWithTicketsSold(event))
  }

  async findAll(): Promise<Event[]> {
    const events = await prisma.event.findMany({
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: { tickets: true },
        },
      }
    })

    return events.map((event) => this.mapEventWithTicketsSold(event))
  }

  async findById(id: string): Promise<Event | null> {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    })

    if (!event) return null

    return this.mapEventWithTicketsSold(event)
  }

  async update(id: string, data: Partial<Event>): Promise<Event> {
    return prisma.event.update({
      where: { id },
      data
    })
  }

  async delete(id: string): Promise<Event> {
    return prisma.event.delete({
      where: { id }
    })
  }
}