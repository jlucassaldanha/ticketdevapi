import { User } from "@prisma/client";
import { RegisterInput } from "../types/user";

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>
    create(data: RegisterInput): Promise<User>
}