import { Event } from "@prisma/client";
import { IEventRepository } from "../interfaces/event-repository.interface";
import { CreateEventData } from "../types/event";
import { prisma } from "../config/database";

export class EventRepository implements IEventRepository {
  async create(data: CreateEventData): Promise<Event> {
    return prisma.event.create({ data })
  }

  async findAll(): Promise<Event[]> {
    return prisma.event.findMany({
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })
  }

  async findById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({
      where: { id }
    })
  }
}