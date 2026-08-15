import { Ticket } from "@prisma/client";
import { CreateTicketData } from "../types/ticket";

export interface ITicketRepository {
  createTicketWithTransaction(
    data: CreateTicketData
  ): Promise<Ticket>
  findByClientId(clientId: string): Promise<Ticket[]>
  findById(id: string): Promise<Ticket | null>
}