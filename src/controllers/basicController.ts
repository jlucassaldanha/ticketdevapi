import { Request, Response } from 'express';

export const basicTest = (req: Request, res: Response) => {
  res.json({ message: 'Servidor TicketDev rodando!' })
}