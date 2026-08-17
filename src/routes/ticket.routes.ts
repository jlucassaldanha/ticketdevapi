import { Router } from "express";
import { TicketRepository } from "../repositories/ticket.repository";
import { TicketService } from "../services/ticket.service";
import { TicketController } from "../controllers/ticket.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const ticketRouter = Router()

const ticketRepository = new TicketRepository()
const ticketService = new TicketService(ticketRepository)
const ticketController = new TicketController(ticketService)

ticketRouter.get('/share/:secureHash', (req, res) => ticketController.share(req, res))
ticketRouter.use(authMiddleware)

ticketRouter.post(
  '/reserve', 
  roleMiddleware(['CONSUMER']), 
  (req, res) => ticketController.reserve(req, res)
)

ticketRouter.get(
  '/my-tickets',
  (req, res) => ticketController.myTickets(req, res)
)

ticketRouter.post(
  '/:id/cancel',
  authMiddleware,
  roleMiddleware(['CONSUMER']),
  (req, res) => ticketController.cancel(req, res)
)

export default ticketRouter