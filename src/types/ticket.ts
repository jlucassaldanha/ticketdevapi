import { Event, Ticket, TicketStatus } from "@prisma/client"

export interface CreateTicketData {
  eventId: string
  clientId: string
  seatNumber?: string | null
  status: TicketStatus
  secureHash: string
}

export interface ReserveTicketInput {
  eventId: string
  seatNumber?: string
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX'
  paymentSimulateStatus?: 'APPROVED' | 'REFUSED'
}

export interface TicketWithEvent extends Ticket {
  event:  {
    title: string,
    date: Date,
    location: string,
    imageUrl: string,
  }
}