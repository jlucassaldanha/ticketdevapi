import { UserRepository } from '../repositories/user.repository';
import { AuthResponse, LoginInput, RegisterInput } from '../types/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterInput) {
    const userExists = await this.userRepository.findByEmail(data.email)

    if (userExists) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const newUser = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    })

    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email)

    if (!user) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password)

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