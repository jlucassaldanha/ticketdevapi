import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { AuthenticatedRequest } from '../types/user';

const authRouter = Router();
const authController = new AuthController();

authRouter.post('/register', (req, res) => authController.register(req, res))
authRouter.post('/login', (req, res) => authController.login(req, res)) 

authRouter.get(
  '/profile/organizer', 
  authMiddleware, 
  roleMiddleware(['ORGANIZADOR']), 
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
  roleMiddleware(['CLIENTE']), 
  (req: AuthenticatedRequest, res) => {
    return res.status(200).json({
      message: 'Seja bem-vindo à área do Cliente!',
      user: req.user
    });
  }
);


export default authRouter