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
      return res.status(500).json({ error: 'Não foi possível publicar o evento.' })
    } 
  }

  async list(req: Request, res: Response) {
    try {
      const events = await this.eventService.listEvents()
      return res.status(200).json(events)
    } catch (error: any) {
      return res.status(500).json({ error: 'Não foi possível listar os eventos' })
    }
  }
}