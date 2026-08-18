import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'file:./prisma/dev.db';

const adapter = new PrismaBetterSqlite3({ url: connectionString });

export const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando sementeira do banco de dados.")

  const hashedPassword = await bcrypt.hash('SenhaTeste123', 10)

  const organizer = await prisma.user.upsert({
    where: { email: 'organizador1@ticketdev.com' },
    update: {},
    create: {
      name: 'Julio Organiza',
      email: 'organizador1@ticketdev.com',
      password: hashedPassword,
      role: 'ORGANIZER',
    },
  })

  const users = [
    {
      name: 'Carlos Organiza',
      email: 'organizador2@ticketdev.com',
      password: hashedPassword,
      role: 'ORGANIZER',
    },
    {
      name: 'Ana Silva',
      email: 'cliente1@ticketdev.com',
      password: hashedPassword,
      role: 'CONSUMER',
    },
    {
      name: 'Bruno Souza',
      email: 'cliente2@ticketdev.com',
      password: hashedPassword,
      role: 'CONSUMER',
    },
    {
      name: 'Valdir Portaria',
      email: 'portaria@ticketdev.com',
      password: hashedPassword,
      role: 'VALIDATOR',
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    })
  }

  const cinemaEvents = [
    {
      id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      title: 'Matrix: Resurrections (Exibição Especial)',
      description: 'Assista ao clássico sci-fi de Neo e Trinity remasterizado em cinema de rua com debate pós-sessão.',
      imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
      externalId: '624860', 
      category: 'Cinema / Sci-Fi',
      date: new Date('2026-09-20T19:00:00Z'),
      location: 'Cine Belas Artes - Sala 1 - São Paulo, SP',
      capacity: 80,
      price: 35.00,
      ticketsSold: 0,
    },
    {
      id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 
      title: 'Duna: Parte Dois (IMAX Experience)',
      description: 'A épica jornada mítica de Paul Atreides rumo à vingança na maior tela do país.',
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
      externalId: '693134', 
      category: 'Cinema / Épico',
      date: new Date('2026-10-05T21:00:00Z'),
      location: 'Espaço Itaú de Cinema - Sala IMAX - São Paulo, SP',
      capacity: 120,
      price: 50.00,
      ticketsSold: 0,
    },
    {
      id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 
      title: 'Interestelar (Especial 12 Anos)',
      description: 'Uma viagem deslumbrante e emocional pelas dobras do espaço-tempo na tela grande.',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
      externalId: '157336', 
      category: 'Cinema / Drama Sci-Fi',
      date: new Date('2026-11-12T18:30:00Z'),
      location: 'Estação NET Botafogo - Rio de Janeiro, RJ',
      capacity: 150,
      price: 40.00,
      ticketsSold: 0,
    },
  ]

  for (const event of cinemaEvents) {
    await prisma.event.upsert({
      where: { id: event.id }, 
      update: {},
      create: {
        ...event,
        organizer: {
          connect: { id: organizer.id },
        },
      },
    });
  }

  console.log('Sementeira concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro na sementeira:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });