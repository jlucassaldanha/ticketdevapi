import { Response } from "express";
import { IGateService } from "../interfaces/gate-service.interface";
import { AuthenticatedRequest } from "../types/user";

export class GateController {
	constructor(private gateService: IGateService) { }

	async validate(req: AuthenticatedRequest, res: Response) {
		try {
			const { secureHash, currentEventId } = req.body

			if (!secureHash || !currentEventId) {
				return res.status(400).json({ error: 'O hash do ingresso e o ID do evento são obrigatórios.' })
			}

			const result = await this.gateService.validateTicket(secureHash, currentEventId)

			if (result.status === 'VALID') {
				return res.status(200).json(result)
			}

			if (result.status === 'INVALID') {
				return res.status(404).json(result)
			}

			if (result.status === 'WRONG_EVENT') {
				return res.status(400).json(result)
			}

			if (result.status === 'ALREADY_USED') {
				return res.status(409).json(result)
			}
		} catch (error: any) {
			console.error('Falha ao validar o ingresso:', error)
			return res.status(500).json({ error: 'Erro interno no servidor. Falha ao validar o ingresso.' })
		}
	}
}