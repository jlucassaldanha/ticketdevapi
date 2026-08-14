import { prisma } from '../config/database';
import { User } from '../generated/prisma/client';
import { CreateUserDTO } from '../types/user';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    })
  }

  async create(data: CreateUserDTO): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role
      }
    })
  }
}