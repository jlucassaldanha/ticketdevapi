import { Router } from "express";
import { TicketRepository } from "../repositories/ticket.repository";
import { GateService } from "../services/gate.service";
import { GateController } from "../controllers/gate.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const gateRouter = Router()

const ticketRepository = new TicketRepository();
const gateService = new GateService(ticketRepository)
const gateController = new GateController(gateService)

gateRouter.post(
  '/validate',
  authMiddleware,
  roleMiddleware(['PORTARIA', 'ORGANIZADOR']),
  (req, res) => gateController.validate(req, res)
)

export default gateRouter