import { UserRepository } from '../repositories/user.repository';
import { CreateUserDTO } from '../types/user';
import bcrypt from 'bcryptjs';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: CreateUserDTO) {
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
}