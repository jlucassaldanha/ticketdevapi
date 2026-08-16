import { NextFunction, Response } from "express";
import { AuthenticatedRequest, UserRole } from "../types/user";
import jwt from 'jsonwebtoken'

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' })
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token malformatado. Use o padrão "Bearer <token>". '})
  }

  const token = parts[1]

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_ticket_dev'
    ) as { userId: string; role: UserRole}

    req.user = {
      id: decoded.userId,
      role: decoded.role
    }

    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}

export function roleMiddleware(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado.' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente para este recurso.' })
    }

    return next()
  }
}