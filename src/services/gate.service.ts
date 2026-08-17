import { IGateService } from "../interfaces/gate-service.interface";
import { ITicketRepository } from "../interfaces/ticket-repository.interface";
import { ValidationResponse } from "../types/gate";

export class GateService implements IGateService {
	constructor(private ticketRepository: ITicketRepository) { }

	async validateTicket(secureHash: string, currentEventId: string): Promise<ValidationResponse> {
		const ticket = await this.ticketRepository.findBySecureHash(secureHash)

		if (!ticket) {
			return {
				status: 'INVALID',
				message: 'Ingresso inválid ou assinatura digital não reconhecida no servidor.'
			}
		}

		if (ticket.eventId !== currentEventId) {
			return {
				status: 'WRONG_EVENT',
				message: `Ingresso não pertence a este evento! Este ingresso é válido apenas para o evento: "${ticket.event.title}".`,
				ticket
			}
		}

		if (ticket.status === 'USED') {
			return {
				status: 'ALREADY_USED',
				message: 'Atenção! Este ingresso já foi validado e utilizado para entrada na portaria anteriormente.',
				ticket
			}
		}

		const updatedTicket = await this.ticketRepository.updateStatus(ticket.id, 'USED')

		return {
			status: 'VALID',
			message: 'Entrada liberada! Ingresso validado com sucesso na portaria.',
      		ticket: updatedTicket
		}
	}
}