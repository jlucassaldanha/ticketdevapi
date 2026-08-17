import { Ticket } from "@prisma/client";
import { CreateTicketData, TicketWithEvent } from "../types/ticket";

export interface ITicketRepository {
  createTicketWithTransaction(
    data: CreateTicketData
  ): Promise<Ticket>
  findByClientId(clientId: string): Promise<Ticket[]>
  findById(id: string): Promise<Ticket | null>
  findBySecureHash(secureHash: string): Promise<TicketWithEvent | null>
  updateStatus(id: string, status: string): Promise<Ticket>
  cancelTicketWithTransaction(ticketId: string, clientId: string): Promise<Ticket>
}