import { Request, Response } from "express";
import { IEventService } from "../interfaces/event-service.interface";
import { AuthenticatedRequest } from "../types/user";

export class EventController {
  constructor(private eventService: IEventService) { }

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const organizerId = req.user?.id
      if (!organizerId) {
        return res.status(401).json({ error: 'Organizador não identificado na seção. '})
      }

      const { externalId, date, location, capacity, price } = req.body

      if (!externalId || !date || !location || !capacity || !price) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes.' })
      }

      const event = await this.eventService.createEvent(organizerId, {
        externalId: String(externalId),
        date,
        location,
        capacity: Number(capacity),
        price: Number(price)
      })

      return res.status(201).json(event)
    } catch (error: any) {
      console.error('Não foi possível publicar o evento:', error)
      return res.status(500).json({ error: 'Erro interno no servidor. Não foi possível publicar o evento.' })
    } 
  }

  async list(req: Request, res: Response) {
    try {
      const events = await this.eventService.listEvents()
      return res.status(200).json(events)
    } catch (error: any) {
      console.error('Não foi possível listar os eventos', error)
      return res.status(500).json({ error: 'Erro interno no servidor. Não foi possível listar os eventos.' })
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const organizerId = req.user!.id
      const updateData = req.body

      const updatedEvent = await this.eventService.updateEvent(id as string, organizerId, updateData)
      return res.status(200).json({
        message: 'Evento atualizado com sucesso!',
        event: updatedEvent
      })
    } catch(error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        return res.status(404).json({ error: 'Evento não localizado para atualização.' })
      }
      if (error.message === 'UNAUTHORIZED_EVENT_ACCESS') {
        return res.status(403).json({ 
          error: 'UNAUTHORIZED_EVENT_ACCESS',
          message: 'Você não tem permissão para editar eventos de outros organizadores.' 
        })
      }
      console.error('Falha ao atualizar evento:', error);
      return res.status(500).json({ error: 'Erro interno do servidor. Falha ao atualizar o evento.' })
    }
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const organizerId = req.user!.id

      await this.eventService.deleteEvent(id as string, organizerId)
      return res.status(200).json({ message: 'Evento excluído com sucesso!' })
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        return res.status(404).json({ error: 'Evento não localizado.' })
      }
      if (error.message === 'EVENT_HAS_SOLD_TICKETS') {
        return res.status(400).json({
          error: 'EVENT_HAS_SOLD_TICKETS',
          message: 'Não é possível excluir um evento que já possui ingressos vendidos.',
        })
      }
      if (error.message === 'UNAUTHORIZED_EVENT_ACCESS') {
        return res.status(403).json({ 
          error: 'UNAUTHORIZED_EVENT_ACCESS',
          message: 'Você não tem permissão para excluir eventos de outros organizadores.' 
        })
      }
      console.error('Falha ao excluir evento:', error)
      return res.status(500).json({ error: 'Erro internodo servidor. Falha ao excluir o evento.' })
    }
  }
}