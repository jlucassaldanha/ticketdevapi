export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'TicketDev API',
    version: '1.0.0',
    description: `
    -  
      Esta é a documentação interativa da TicketDev API, desenvolvida para o Desafio Elite Dev 2026.
      
      Aqui você pode testar em tempo real todos os fluxos de integração com o catálogo do TMDb, 
      gerenciamento de eventos, simulação de pagamentos, reserva concorrente de assentos e validação de ingressos na portaria.
      
      Como testar rotas protegidas:
        1. Use o endpoint 'POST /api/auth/register' para criar um usuário ou use as contas pré-semeadas (seed).
        2. Faça o login em 'POST /api/auth/login' para obter seu token JWT.
        3. Clique no botão azul "Authorize" no topo direito desta página.
        4. Cole o token e confirme.
    -
    `,
  },
  servers: [
    {
      url: '/',
      description: 'Servidor Atual',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['ORGANIZER', 'CONSUMER', 'VALIDATOR'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          imageUrl: { type: 'string', nullable: true },
          externalId: { type: 'string' },
          category: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          location: { type: 'string' },
          capacity: { type: 'integer' },
          price: { type: 'number' },
          ticketsSold: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Ticket: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          eventId: { type: 'string' },
          clientId: { type: 'string' },
          seatNumber: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['ACTIVE', 'USED'] },
          secureHash: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Criar um novo usuário',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string', example: 'Client Um' },
                  email: { type: 'string', example: 'cliente1@ticketdev.com' },
                  password: { type: 'string', example: 'SenhaTeste123' },
                  role: { type: 'string', enum: ['ORGANIZER', 'CONSUMER', 'VALIDATOR'], example: 'CONSUMER' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuário cadastrado com sucesso.' },
          400: { description: 'E-mail já cadastrado ou dados inválidos.' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Autenticar usuário e gerar JWT',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'cliente1@ticketdev.com' },
                  password: { type: 'string', example: 'SenhaTeste123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Autenticação realizada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'Credenciais inválidas.' },
          404: { description: 'Usuário não encontrado.' },
        },
      },
    },

    '/api/catalog/popular': {
      get: {
        summary: 'Listar filmes populares (Catálogo Externo)',
        tags: ['Catálogo (TMDb)'],
        responses: {
          200: { description: 'Lista de filmes populares retornada com sucesso.' },
        },
      },
    },
    '/api/catalog/search': {
      get: {
        summary: 'Buscar filmes no catálogo por texto',
        tags: ['Catálogo (TMDb)'],
        parameters: [
          {
            name: 'query',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Texto para pesquisar os filmes',
            example: 'Matrix',
          },
        ],
        responses: {
          200: { description: 'Resultado da busca retornado com sucesso.' },
          400: { description: 'Parâmetro query ausente.' },
        },
      },
    },

    '/api/events': {
      get: {
        summary: 'Listar todos os eventos publicados',
        tags: ['Eventos'],
        responses: {
          200: {
            description: 'Lista de eventos cadastrados no sistema.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Event' },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Publicar um novo evento a partir de um filme (Apenas Organizadores)',
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
                  externalId: { type: 'string', example: '101', description: 'ID do filme no TMDb' },
                  date: { type: 'string', format: 'date-time', example: '2026-10-15T20:00:00.000Z' },
                  location: { type: 'string', example: 'Allianz Parque - São Paulo, SP' },
                  capacity: { type: 'integer', example: 100 },
                  price: { type: 'number', example: 20.0 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Evento criado e publicado com sucesso.' },
          401: { description: 'Não autorizado.' },
          403: { description: 'Acesso negado (Apenas organizadores).' },
        },
      },
    },

    '/api/tickets/reserve': {
      post: {
        summary: 'Reservar assento e simular pagamento (Apenas Clientes)',
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
                  seatNumber: { type: 'string', example: 'A12', description: 'Opcional (se omitido, será Pista)' },
                  paymentMethod: { type: 'string', enum: ['CREDIT_CARD', 'DEBIT_CARD', 'PIX'], example: 'CREDIT_CARD' },
                  paymentSimulateStatus: { type: 'string', enum: ['APPROVED', 'REFUSED'], example: 'APPROVED' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Ingresso reservado e pago com sucesso!' },
          400: { description: 'Capacidade esgotada ou campos obrigatórios ausentes.' },
          402: { description: 'Simulação: Pagamento recusado pela operadora.' },
          409: { description: 'Este assento já está reservado por outro cliente.' },
        },
      },
    },
    '/api/tickets/my-tickets': {
      get: {
        summary: 'Listar ingressos do cliente logado',
        tags: ['Ingressos'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Seus ingressos ativos.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Ticket' },
                },
              },
            },
          },
        },
      },
    },
    '/api/tickets/share/{secureHash}': {
      get: {
        summary: 'Visualizar ingresso compartilhado (Público)',
        tags: ['Ingressos'],
        parameters: [
          {
            name: 'secureHash',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Hash seguro de assinatura do ingresso',
          },
        ],
        responses: {
          200: { description: 'Detalhes do ingresso compartilhado localizados com sucesso.' },
          404: { description: 'Ingresso inválido ou não encontrado.' },
        },
      },
    },

    '/api/gate/validate': {
      post: {
        summary: 'Validar QR Code/Ingresso na Portaria (Portaria/Organizador)',
        tags: ['Portaria'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['secureHash', 'currentEventId'],
                properties: {
                  secureHash: { type: 'string', example: 'hash-do-ingresso-aqui' },
                  currentEventId: { type: 'string', example: 'id-do-evento-aqui' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'VALID: Entrada liberada!' },
          400: { description: 'WRONG_EVENT: Ingresso pertence a outro evento.' },
          404: { description: 'INVALID: Ingresso ou assinatura falsificada/inexistente.' },
          409: { description: 'ALREADY_USED: Ingresso já foi utilizado para entrar.' },
        },
      },
    },
  },
};