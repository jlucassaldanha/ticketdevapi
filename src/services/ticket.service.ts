import { Ticket } from "@prisma/client";
import { ITicketRepository } from "../interfaces/ticket-repository.interface";
import { ITicketService } from "../interfaces/ticket-service.interface";
import { ReserveTicketInput } from "../types/ticket";
import crypto from 'crypto';

export class TicketService implements ITicketService {
  constructor(private ticketRepository: ITicketRepository) { }

  async reserveTicket(clientId: string, input: ReserveTicketInput): Promise<Ticket> {
    const seat = input.seatNumber ? input.seatNumber.trim().toUpperCase() : null

    if (input.paymentSimulateStatus === 'REFUSED') {
      throw new Error('PAYMENT_REFUSED');
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_ticket_dev'
    const payload = `${input.eventId}=${clientId}-${seat || 'PISTA'}-${Date.now()}`
    const secureHash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    try {
      return await this.ticketRepository.createTicketWithTransaction({
        eventId: input.eventId,
        clientId,
        seatNumber: seat,
        status: 'ACTIVE',
        secureHash
      })
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        throw new Error('EVENT_NOT_FOUND')
      }
      if (error.message === 'EVENT_SOLD_OUT') {
        throw new Error('EVENT_SOLD_OUT')
      }
      if (error.code === 'P2002') {
        throw new Error('SEAT_ALREADY_RESERVED')
      }
      throw error
    }
  }

  async getClientTickets(clientId: string): Promise<Ticket[]> {
    return this.ticketRepository.findByClientId(clientId)
  }

  async getTicketByHash(secureHash: string): Promise<Ticket | null> {
    const ticket = await this.ticketRepository.findBySecureHash(secureHash)
    if (!ticket) {
      throw new Error('TICKET_NOT_FOUND')
    }
    return ticket
  }

  async cancelTicket(ticketId: string, clientId: string): Promise<Ticket> {
    return this.ticketRepository.cancelTicketWithTransaction(ticketId, clientId)
  }
}