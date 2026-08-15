import { Router } from "express";
import { TMDBController } from "../controllers/tmdb.controller";
import { TMDBService } from "../services/tmdb.service";

const catalogRouter = Router()

const tmdbService = new TMDBService()
const tmdbController = new TMDBController(tmdbService)

catalogRouter.get('/popular', (req, res) => tmdbController.getPopular(req, res))
catalogRouter.get('/search', (req, res) => tmdbController.search(req, res))

export default catalogRouter