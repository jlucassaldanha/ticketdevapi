import { Event } from "@prisma/client";
import { CreateEventData } from "../types/event";

export interface IEventRepository {
    create(data: CreateEventData): Promise<Event>
    findAll(): Promise<Event[]>
    findById(id: string): Promise<Event | null> 
}