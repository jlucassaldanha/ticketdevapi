export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'TicketDev API',
    version: '1.0.0',
    description: 'Plataforma de Eventos e Ingressos - Desafio Elite Dev 2026',
    contact: {
      name: 'Suporte TicketDev',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Servidor Local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT retornado no login para acessar rotas protegidas.',
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Cadastrar um novo usuário',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string', example: 'Ana Silva' },
                  email: { type: 'string', example: 'ana@ticketdev.com' },
                  password: { type: 'string', example: 'SenhaTeste123' },
                  role: { type: 'string', example: 'CLIENTE', description: 'ORGANIZADOR, CLIENTE ou PORTARIA' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuário cadastrado com sucesso.' },
          400: { description: 'Dados inválidos ou e-mail já cadastrado.' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Autenticar usuário e gerar Token',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'ana@ticketdev.com' },
                  password: { type: 'string', example: 'SenhaTeste123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Autenticação bem-sucedida.' },
          401: { description: 'Credenciais inválidas.' },
        },
      },
    },
    '/api/events': {
      get: {
        summary: 'Listar todos os eventos',
        tags: ['Eventos'],
        responses: {
          200: { description: 'Lista de eventos retornada com sucesso.' },
        },
      },
      post: {
        summary: 'Criar um novo evento a partir do catálogo (Apenas Organizadores)',
        tags: ['Eventos'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['externalId', 'date', 'location', 'capacity', 'price'],
                properties: {
                  externalId: { type: 'string', example: '101' },
                  date: { type: 'string', example: '2026-10-15T20:00:00.000Z' },
                  location: { type: 'string', example: 'Teatro Municipal' },
                  capacity: { type: 'number', example: 150 },
                  price: { type: 'number', example: 85.50 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Evento criado com sucesso.' },
          401: { description: 'Não autorizado.' },
        },
      },
    },
    '/api/tickets/reserve': {
      post: {
        summary: 'Reservar e simular o pagamento de um ingresso (Apenas Clientes)',
        tags: ['Ingressos'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['eventId', 'paymentMethod'],
                properties: {
                  eventId: { type: 'string', example: 'id-do-evento-aqui' },
                  seatNumber: { type: 'string', example: 'B15', description: 'Opcional' },
                  paymentMethod: { type: 'string', example: 'CREDIT_CARD' },
                  paymentSimulateStatus: { type: 'string', example: 'APROVADO', description: 'APROVADO ou RECUSADO' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Ingresso reservado e pago com sucesso.' },
          402: { description: 'Pagamento recusado.' },
          409: { description: 'Assento já reservado.' },
        },
      },
    },
  },
};