import { AuthResponse, LoginInput, RegisterInput, UserWithoutPassword } from "../types/user";

export interface IAuthService {
    register(input: RegisterInput): Promise<UserWithoutPassword>
    login(input: LoginInput): Promise<AuthResponse>
}