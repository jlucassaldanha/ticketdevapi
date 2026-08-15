import { Router } from "express";
import { TMDBController } from "../controllers/tmdb.controller";

const catalogRouter = Router()
const tmdbController = new TMDBController()

catalogRouter.get('/popular', (req, res) => tmdbController.getPopular(req, res))
catalogRouter.get('/search', (req, res) => tmdbController.search(req, res))

export default catalogRouter