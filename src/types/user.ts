import { Role } from '@prisma/client'
import { Request } from "express"

export interface RegisterInput {
  name: string
  email: string
  password: string
  role: Role
}

export interface LoginInput {
  email: string
  password: string
}

export interface UserWithoutPassword {
  id: string
  name: string
  email: string
  role: Role
  createdAt: Date
}

export interface AuthResponse {
  user: UserWithoutPassword
  token: string
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: Role
  }
}