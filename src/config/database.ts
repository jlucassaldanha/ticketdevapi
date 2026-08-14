import { PrismaClient } from '../generated/prisma/client.js';

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
} as any);