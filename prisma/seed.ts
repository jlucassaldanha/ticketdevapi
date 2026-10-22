import 'dotenv/config';
import { PrismaClient, Role, TicketStatus } from '@prisma/client';
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

  const client1 = await prisma.user.findUnique({
    where: { email: 'cliente1@ticketdev.com' },
  })

  if (!client1) {
    throw new Error('Consumidor principal não encontrado para associar os ingressos.')
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
    {
      id: 'g545ytf65-756hh-65hh7-hr56-6y65hh767', 
      title: 'Pulp Fiction: Tempo de Violência (1994)',
      description: 'Vincent Vega e Jules Winnfield são dois assassinos profissionais que trabalham fazendo cobranças para Marsellus Wallace, um poderosos gângster. Vega é forçado a sair com a garota do chefe, temendo passar dos limites. Enquanto isso, o pugilista Butch Coolidge se mete em apuros por ganhar uma luta que deveria perder.',
      imageUrl: 'https://image.tmdb.org/t/p/w1280/tptjnB2LDbuUWya9Cx5sQtv5hqb.jpg',
      externalId: '2341243', 
      category: 'Cinema',
      date: new Date('2026-11-12T18:30:00Z'),
      location: 'Cinema Ficticio 4',
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

  const tickets = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      eventId: cinemaEvents[0].id,
      clientId: client1.id,
      seatNumber: 'A01',
      status: TicketStatus.ACTIVE, 
      secureHash: 'hash-ingresso-ativo-001',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      eventId: cinemaEvents[0].id,
      clientId: client1.id,
      seatNumber: 'A02',
      status: TicketStatus.USED, 
      secureHash: 'hash-ingresso-usado-002',
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      eventId: cinemaEvents[1].id,
      clientId: client1.id,
      seatNumber: 'B05',
      status: TicketStatus.CANCELLED, 
      secureHash: 'hash-ingresso-cancelado-003',
    },
  ];

  for (const ticket of tickets) {
    await prisma.ticket.upsert({
      where: { id: ticket.id },
      update: {},
      create: ticket,
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