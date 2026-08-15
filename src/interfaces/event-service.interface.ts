import { Event } from "@prisma/client";
import { CreateEventInput } from "../types/event";

export interface IEventService {
    createEvent(organizerId: string, input: CreateEventInput): Promise<Event>
    listEvents(): Promise<Event[]>
}