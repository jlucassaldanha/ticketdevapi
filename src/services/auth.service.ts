import { IAuthService } from '../interfaces/auth-service.interface';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { UserRepository } from '../repositories/user.repository';
import { AuthResponse, LoginInput, RegisterInput, UserWithoutPassword } from '../types/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService implements IAuthService {

  constructor(private userRepository: IUserRepository) { }

  async register(input: RegisterInput): Promise<UserWithoutPassword> {
    const userExists = await this.userRepository.findByEmail(input.email)

    if (userExists) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const hashedPassword = await bcrypt.hash(input.password, 10)

    const newUser = await this.userRepository.create({
      ...input,
      password: hashedPassword,
    })

    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(input.email)

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password)

    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_ticket_dev',
      { expiresIn: '1d' }
    )

    const { password, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
    }
  }
}