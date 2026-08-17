# TicketDev API 🎫 — Plataforma de Eventos e Ingressos

Este é o back-end da **TicketDev API**, desenvolvido para o **Desafio Elite Dev 2026**. Trata-se de uma solução estruturada sob os mais rigorosos padrões de arquitetura de software para gerenciar o ciclo completo de venda e validação de ingressos.

---

## 🚀 Como Executar o Projeto

Em ambiente de desenvolvimento local, certifique-se de ter o **Node.js (v22+)** instalado e execute os comandos abaixo no terminal da raiz do seu projeto:

**1. Instalar as dependências**

```bash
npm install

```

**2. Criar e configurar o .env local**

Crie o arquivo na raiz do projeto.

```env
DATABASE_URL="file:./dev.db"
PORT=3000
JWT_SECRET="TOKEN_SUPER_SECRETO"
TMDB_API_KEY="api_key_do_tmdb"

```

**3. Gerar as tipagens do Prisma Client**

```bash
npx prisma generate

```

**4. Aplicar as migrações existentes e popular o banco (Seed)**

```bash
npx prisma migrate dev

```

**5. Iniciar o servidor em modo de desenvolvimento**

```bash
npm run dev

```


O servidor estará ativo em: `http://localhost:3000`  
A documentação estará disponível em: `http://localhost:3000/api-docs`

---

## 📑 Documentação dos Endpoints (Swagger UI)

Toda a documentação técnica detalhada dos endpoints, com exemplos de corpos de requisição (JSON), parâmetros de consulta e respostas HTTP, está centralizada e disponível de forma interativa via Swagger.

Para testar as chamadas diretamente do seu navegador:
1. Acesse: **`http://localhost:3000/api-docs`**
2. Realize o login no endpoint `/api/auth/login` para copiar o token JWT.
3. Clique em **"Authorize"** no topo direito da tela do Swagger.
4. Cole seu token e explore as operações!

### Endpoints Mapeados no Swagger:

*   **Autenticação (`/api/auth`)**: Cadastro de novos usuários e login com geração de token JWT.
*   **Catálogo (`/api/catalog`)**: Integração e busca de filmes no catálogo externo do TMDb.
*   **Eventos (`/api/events`)**: Criação e publicação de eventos (exclusivo para Organizadores).
*   **Ingressos (`/api/tickets`)**: Reserva de assentos marcados/pista, simulação de pagamentos e link de compartilhamento de ingressos.
*   **Portaria (`/api/gate`)**: Validação de ingressos e QR Codes (exclusivo para Portaria e Organizadores).

---

## 🏗️ Decisões Arquiteturais (Sênior Craftsmanship)

Fugindo de estruturas genéricas, este back-end foi arquitetado com foco em segurança, desacoplamento de código e alta manutenibilidade:

### 1. Inversão de Dependência (SOLID - DIP)

Todo o sistema é estruturado através de **Interfaces** (`src/interfaces/`) e **Injeção de Dependência Manual (DI)** via construtores. As camadas de controle (`Controllers`) e de negócios (`Services`) dependem estritamente de contratos abstratos, e não de implementações concretas (banco ou APIs externas). Isso torna o código testável de forma isolada com mocks em 100% dos fluxos.

### 2. Controle de Concorrência e Sobrevenda (Race Conditions)

A reserva de assentos marcados e o controle de capacidade máxima dos eventos são blindados no banco de dados utilizando **Transações Isoladas (`prisma.$transaction`)** com o tipo estrito `Prisma.TransactionClient`.
*   O incremento de `ticketsSold` e a criação de registros `Ticket` ocorrem de forma atômica e serializada.
*   A restrição física de banco de dados `@@unique([eventId, seatNumber])` impede de forma definitiva que duas requisições simultâneas comprem o mesmo assento reservado no mesmo milissegundo.

### 3. Validação Segura Offline (HMAC-SHA256)

Cada ingresso gerado carrega um campo `secureHash` gerado no servidor usando **HMAC-SHA256** assinado com o segredo do JWT (`JWT_SECRET`). Isso permite que a portaria decodifique e valide a integridade do QR Code e verifique sua autenticidade de forma rápida e segura.

### 4. Gestão de Status de Validação na Portaria
O fluxo de validação na portaria (`POST /api/gate/validate`) foi desenhado para retornar as seguintes respostas amigáveis exigidas pelo edital:
*   `VALID` (200 OK): Entrada permitida, mudando o status para `UTILIZADO`.
*   `ALREADY_USED` (409 Conflict): Impede tentativas de fraude por cópias físicas ou capturas de tela do QR Code.
*   `WRONG_EVENT` (400 Bad Request): Alerta caso o ingresso pertença a outro evento da plataforma.
*   `INVALID` (404 Not Found): Retorno para ingressos inexistentes ou com assinaturas digitais violadas.

---

## 🤖 Declaração de Uso de IA (Transparência & Parceria Estratégica)

Diferente de abordagens automatizadas ou de geração cega de código ("AI slop"), este projeto foi totalmente idealizado, digitado e estruturado pelo candidato. A IA foi utilizada de forma estratégica e pontual, atuando como um sparring partner / consultor:

### • Modelo de Colaboração (O "Candidato como dev júnior" e a "IA como Dev Sênior")

Diferente de abordagens automatizadas ou templates prontos que geram código sem critério ("AI slop"), o desenvolvimento seguiu uma relação estrita de **parceria de engenharia ativa**:

1. **O Candidato como dev:**
Definiu as diretrizes e regras funcionais de segurança do edital, as escolhas tecnológicas avançadas (Express + ESM moderno em modo `NodeNext`, Prisma 7 e SQLite), o design de concorrência com transações isoladas e a modelagem estrita de papéis de usuários.
2. **A IA como Consultor Sênior:**
Atuou estritamente como uma ferramenta de Pair Programming para suporte técnico. Foi consultada para propor padrões de design estruturais limpos, auxiliar no entendimento e resolução de erros complexos de compilação do TypeScript e ajudar a debugar tipagens estendidas do Prisma para evitar o uso de `: any` na aplicação.

### • Blindagem Contra o "AI Slop"

* **Entendimento Completo e Domínio Técnico:**
Cada linha de código foi revisada e compreendida detalhadamente pelo candidato, garantindo domínio total sobre os fluxos de dados, regras de concorrência de ingressos, geração de HMAC e simulação de pagamentos.
* **Craftsmanship Humano:** 
Todas as decisões finais de organização de diretórios, decisões arquiteturais, regras de fluxo de caixa simulado de pagamentos e a estruturação de injeção manual de dependências foram arquitetadas e executadas manualmente por mim. O cérebro do projeto manteve-se 100% humano, garantindo um código limpo, legível e de altíssima fidelidade às boas práticas modernas de desenvolvimento web.
