import { Event } from "@prisma/client";
import { CreateEventInput } from "../types/event";

export interface IEventService {
    createEvent(organizerId: string, input: CreateEventInput): Promise<Event>
    getEventsByOrganizer(organizerId: string): Promise<Event[]>
    listEvents(): Promise<Event[]>
    updateEvent(id: string, organizerId: string, data: Partial<Event>): Promise<Event>
    deleteEvent(id: string, organizerId: string): Promise<Event>
}