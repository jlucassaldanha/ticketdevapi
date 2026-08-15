import { User } from '@prisma/client';
import { prisma } from '../config/database';
import { RegisterInput } from '../types/user';
import { IUserRepository } from '../interfaces/user-repository.interface';

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    })
  }

  async create(data: RegisterInput): Promise<User> {
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