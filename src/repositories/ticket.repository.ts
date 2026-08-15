import { Prisma, Ticket } from "@prisma/client";
import { ITicketRepository } from "../interfaces/ticket-repository.interface";
import { CreateTicketData } from "../types/ticket";
import { prisma } from "../config/database";

export class TicketRepository implements ITicketRepository {
  async createTicketWithTransaction(data: CreateTicketData): Promise<Ticket> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const event = await tx.event.findUnique({
        where: { id: data.eventId }
      })

      if (!event) {
        throw new Error('EVENT_NOT_FOUND')
      }

      if (event.ticketsSold >= event.capacity) {
        throw new Error('EVENT_SOLD_OUT')
      }

      const ticket = await tx.ticket.create({
        data: {
          eventId: data.eventId,
          clientId: data.clientId,
          seatNumber: data.seatNumber || null,
          status: data.status,
          secureHash: data.secureHash
        }
      })

      await tx.event.update({
        where: { id: data.eventId },
        data: {
          ticketsSold: {
            increment: 1
          }
        }
      })

      return ticket
    })
  }

  async findByClientId(clientId: string): Promise<Ticket[]> {
    return prisma.ticket.findMany({
      where: { clientId },
      include: {
        event: {
          select: {
            title: true,
            date: true,
            location: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  findById(id: string): Promise<Ticket | null> {
    return prisma.ticket.findUnique({
      where: { id },
      include: { event: true, client: true }
    })
  }
}