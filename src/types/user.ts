import { Request } from "express"

export type UserRole = 'ORGANIZADOR' | 'CLIENTE' | 'PORTARIA'

export interface RegisterInput {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface LoginInput {
  email: string
  password: string
}

export interface UserWithoutPassword {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
}

export interface AuthResponse {
  user: UserWithoutPassword
  token: string
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: UserRole
  }
}