import { Request, Response } from "express";
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
      console.error('Falha ao processar a reserva:', error)
      return res.status(500).json({ error: 'Erro interno no servidor. Falha ao processar a reserva.' })
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
      console.error('Falha ao buscar seus ingressos:', error)
      return res.status(500).json({ error: 'Erro interno no servidor. Falha ao buscar seus ingressos.' })
    }
  }

  async share(req: Request, res: Response) {
    try {
      const { secureHash } = req.params

      if (!secureHash) {
        return res.status(400).json({ error: 'O hash do ingresso é obrigatório.' })
      }

      const ticket = await this.ticketService.getTicketByHash(secureHash as string)

      return res.status(200).json({
        message: 'Ingresso localizado com sucesso!',
        ticket
      })
    } catch (error: any) {
      if (error.message === 'TICKET_NOT_FOUND') {
        return res.status(404).json({ error: 'Ingresso inválido ou inexistente.' })
      }
      console.error('Falha ao buscar o ingresso compartilhado:', error)
      return res.status(500).json({ error: 'Erro interno no servidor. Falha ao buscar o ingresso compartilhado.' })
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const clientId = req.user!.id

      const cancelledTicket = await this.ticketService.cancelTicket(id as string, clientId)

      return res.status(200).json({
        message: 'Ingresso cancelado com sucesso e vaga devolvida ao estoque!',
        ticket: cancelledTicket,
      })
    } catch (error: any) {
      if (error.message === 'TICKET_NOT_FOUND') {
        return res.status(404).json({ error: 'Ingresso não localizado.' })
      }
      if (error.message === 'UNAUTHORIZED') {
        return res.status(403).json({ error: 'Você não tem autorização para cancelar este ingresso.' })
      }
      if (error.message === 'TICKET_ALREADY_CANCELLED') {
        return res.status(400).json({ error: 'Este ingresso já se encontra cancelado.' })
      }
      if (error.message === 'TICKET_ALREADY_USED') {
        return res.status(400).json({ error: 'Não é possível cancelar um ingresso que já foi utilizado.' })
      }
      console.error('Falha ao cancelar ingresso:', error)
      return res.status(500).json({ error: 'Erro interno do servidor. Falha ao realizar o cancelamento.' })
    }
  }
}