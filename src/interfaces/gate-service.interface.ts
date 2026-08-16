import { ValidationResponse } from "../types/gate";

export interface IGateService {
	validateTicket(secureHash: string, currentEventId: string): Promise<ValidationResponse>
}