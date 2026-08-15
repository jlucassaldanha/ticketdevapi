import { Response } from "express";
import { ITicketService } from "../interfaces/ticket-service.interface";
import { AuthenticatedRequest } from "../types/user";

export class TicketController {
  constructor(private ticketService: ITicketService) { }

  async reserve(req: AuthenticatedRequest, res: Response) {
    const { eventId, seatNumber, paymentMethod, paymentSimulateStatus } = req.body

    if(!eventId || !paymentMethod) {
      return res.status(400).json({ error: 'O ID do evento e metodo de pagamento são obrigatórios.' })
    }

    try {
      const clientId = req.user?.id

      if(!clientId) {
        return res.status(401).json({ error: 'Usuário não autenticado.' })
      }
      
      if (!eventId) {
        return res.status(400).json({ error: 'O Id do evento é obrigatório.' })
      }

      const ticket = await this.ticketService.reserveTicket(clientId, {
        eventId,
        seatNumber,
        paymentMethod,
        paymentSimulateStatus
      })

      return res.status(201).json({
        message: 'Ingresso reservado e pago com sucesso!',
        ticket
      })
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        return res.status(404).json({ error: 'O evento solicitado não existe.' })
      }
      if (error.message === 'EVENT_SOLD_OUT') {
        return res.status(400).json({ error: 'Desculpe, este evento já está totalmente esgotado!' })
      }
      if (error.message === 'SEAT_ALREADY_RESERVED') {
        return res.status(409).json({ error: 'Este assento já foi reservado por outro cliente. Por favor, escolha outro assento.' })
      }
      if (error.message === 'PAYMENT_REFUSED') {
        return res.status(402).json({ 
          error: 'PAGAMENTO_RECUSADO',
          message: 'A operadora financeira recusou a transação. Verifique os dados do cartão de crédito simulado.' 
        })
      }

      return res.status(500).json({ error: 'Erro interno ao processar a reserva.' })
    }
  }

  async myTickets(req: AuthenticatedRequest, res: Response) {
    try {
      const clientId = req.user?.id
      if (!clientId) {
        return res.status(401).json({ error: 'Usuário não autenticado.' })
      }

      const tickets = await this.ticketService.getClientTickets(clientId)
      return res.status(200).json(tickets)
    } catch (error: any) {
      console.error('Erro ao buscar ingressos do cliente:', error)
      return res.status(500).json({ error: 'Erro interno ao buscar seus ingressos.' })
    }
  }
}