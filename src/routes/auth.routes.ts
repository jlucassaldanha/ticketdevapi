import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { AuthenticatedRequest } from '../types/user';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';

const authRouter = Router();

const userRepository = new UserRepository()
const authService = new AuthService(userRepository)
const authController = new AuthController(authService);

authRouter.post('/register', (req, res) => authController.register(req, res))
authRouter.post('/login', (req, res) => authController.login(req, res)) 

authRouter.get(
  '/profile/organizer', 
  authMiddleware, 
  roleMiddleware(['ORGANIZER']), 
  (req: AuthenticatedRequest, res) => {
    return res.status(200).json({
      message: 'Seja bem-vindo à área do Organizador!',
      user: req.user
    });
  }
);

authRouter.get(
  '/profile/client', 
  authMiddleware, 
  roleMiddleware(['CONSUMER']), 
  (req: AuthenticatedRequest, res) => {
    return res.status(200).json({
      message: 'Seja bem-vindo à área do Cliente!',
      user: req.user
    });
  }
);


export default authRouter