import { Ticket } from "@prisma/client";
import { ReserveTicketInput } from "../types/ticket";

export interface ITicketService {
  reserveTicket(clientId: string, input: ReserveTicketInput): Promise<Ticket>
  getClientTickets(clientId: string): Promise<Ticket[]>
  getTicketByHash(secureHash: string): Promise<Ticket | null>                                             
}