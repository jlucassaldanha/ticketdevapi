export type UserRole = 'ORGANIZADOR' | 'CLIENTE' | 'PORTARIA'

export interface CreateUserDTO {
  name: string
  email: string
  password: string
  role: UserRole
}