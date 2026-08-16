import { Ticket } from "@prisma/client"

export interface ValidationResponse {
	status: 'VALID' | 'INVALID' | 'ALREADY_USED' | 'WRONG_EVENT'
	message: string
	ticket?: Ticket
}