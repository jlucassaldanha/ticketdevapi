import { Router } from "express";
import { EventRepository } from "../repositories/event.repository";
import { TMDBService } from "../services/tmdb.service";
import { EventService } from "../services/event.service";
import { EventController } from "../controllers/event.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const eventRouter = Router()

const eventRepository = new EventRepository()
const tmdbService = new TMDBService()
const eventService = new EventService(eventRepository, tmdbService)
const eventController = new EventController(eventService)

eventRouter.get('/', (req, res) => eventController.list(req, res))

eventRouter.post(
  '/',
  authMiddleware,
  roleMiddleware(['ORGANIZADOR']),
  (req, res) => eventController.create(req, res)
)

export default eventRouter