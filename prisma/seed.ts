import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

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
      role: Role.ORGANIZER,
    },
  })

  const users = [
    {
      name: 'Carlos Organiza',
      email: 'organizador2@ticketdev.com',
      password: hashedPassword,
      role: Role.ORGANIZER,
    },
    {
      name: 'Ana Silva',
      email: 'cliente1@ticketdev.com',
      password: hashedPassword,
      role: Role.CONSUMER,
    },
    {
      name: 'Bruno Souza',
      email: 'cliente2@ticketdev.com',
      password: hashedPassword,
      role: Role.CONSUMER,
    },
    {
      name: 'Valdir Portaria',
      email: 'portaria@ticketdev.com',
      password: hashedPassword,
      role: Role.VALIDATOR,
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
      title: 'O Poderoso Chefão: Parte II (1974)',
      description: 'Após a máfia matar sua família, o jovem Vito foge da sua cidade na Sicília e vai para a América. Vito luta para manter sua família. Ele mata Black Hand Fanucci, que exigia dos comerciantes uma parte dos seus ganhos. Com a morte de Fanucci, o poderio de Vito cresce, mas sua família é o que mais importa para ele. Agora baseado no Lago Tahoe, Michael planeja fazer incursões em Las Vegas e Havana instalando negócios ligados ao lazer, mas descobre que aliados como Hyman Roth estão tentando matá-lo.',
      imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_face/3ViYPhSAPwH2avQjdMl49F8PklB.jpg',
      externalId: '624860', 
      category: 'Cinema',
      date: new Date('2026-09-20T19:00:00Z'),
      location: 'Cinema Ficticio 1',
      capacity: 80,
      price: 35.00,
      ticketsSold: 0,
    },
    {
      id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 
      title: 'Homem-Aranha: Um Novo Dia (2026)',
      description: 'É um novo dia para Peter Parker. Combatendo o crime em tempo integral como Homem-Aranha em um mundo que não se lembra mais dele e lidando com a pressão de ver seus antigos amigos seguirem em frente sem sua presença, Peter passa por uma mudança que talvez nem ele tenha o poder de controlar. Mas essa transformação também pode ser a única coisa capaz de deter uma surpreendente nova ameaça à cidade e às pessoas que ele ama: um poderoso vilão que ninguém sequer consegue enxergar.',
      imageUrl: 'https://image.tmdb.org/t/p/w1280/x0nvYzQpyJc5pdT9lMnkMuYAg0O.jpg',
      externalId: '693134', 
      category: 'Cinema',
      date: new Date('2026-10-05T21:00:00Z'),
      location: 'Cinema Ficticio 2',
      capacity: 120,
      price: 50.00,
      ticketsSold: 0,
    },
    {
      id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 
      title: 'Taxi Driver: Motorista de Táxi (1976)',
      description: 'Veterano de guerra mentalmente instável trabalha como taxista em Nova York. Decadência e desprezo alimentam seu desejo de ação violenta.',
      imageUrl: 'https://image.tmdb.org/t/p/w1280/hvJvOYRrF9xxvNzg2Jd9PYWu7c3.jpg',
      externalId: '157336', 
      category: 'Cinema',
      date: new Date('2026-11-12T18:30:00Z'),
      location: 'Cinema Ficticio 3',
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
    process.exit(0)
  })
  .finally(async () => {
    await prisma.$disconnect();
  });