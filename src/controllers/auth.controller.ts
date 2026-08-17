import { Request, Response } from 'express';
import { UserRole } from '../types/user';
import { IAuthService } from '../interfaces/auth-service.interface';


export class AuthController {
  constructor(private authService: IAuthService) { }

  async register(req: Request, res: Response) {
    try {
      const { email, name, password, role } = req.body;

      if (!email || !name || !password || !role) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios"})
      }

      const validRoles: UserRole[] = ["ORGANIZADOR", "CLIENTE", "PORTARIA"];
      if (!validRoles.includes(role.toUpperCase() as UserRole)) {
        return res.status(400).json({ error: "Cargo inválido." })
      }

      const user = await this.authService.register({
        name, 
        email, 
        password, 
        role: role.toUpperCase() as UserRole
      })

      return res.status(201).json(user)
    } catch (error: any) {
      if (error.message === "EMAIL_ALREADY_EXISTS") {
        return res.status(400).json({ error: "Este e-mail já está em uso."})
      }

      return res.status(500).json({ error: 'Erro interno do servidor.' })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios' })
      }

      const result = await this.authService.login({ email, password })

      return res.status(200).json(result)
    } catch (error: any) {
      if (error.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ error: 'Erro interno do servidor.' })
      }
    }
  }
}