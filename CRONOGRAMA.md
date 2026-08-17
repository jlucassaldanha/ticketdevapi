# Histórico de Desenvolvimento (Diário de Bordo) — 3 Dias de Sprint 🚀

Este documento mostra como tudo foi planejado, codificado e refinado nos últimos **3 dias** no back-end da **TicketDev API**.
---

## 📅 Dia 1: Estrutura, Setup Moderno & Autenticação Segura (RBAC)
*O foco do primeiro dia foi preparar as fundações da casa: configurar o ambiente estrito do TypeScript e estruturar o sistema de acesso dos usuários.*

*   **Construção da fundação:**
    *   Criação de uma API simples para teste e comunicação com frontend.
    *   Endpoints de criação e login de usuário.
    *   Criação do banco de dados com modelagem da restrição física de unicidade **`@@unique([eventId, seatNumber])`**, bloqueando nativamente reservas duplicadas do mesmo lugar marcado para um evento.

## 📅 Dia 2: Integração de Catálogo Externo & Publicação de Eventos
*No segundo dia, conectamos o sistema com o mundo externo, permitindo que organizadores criassem eventos de forma dinâmica a partir de filmes reais do cinema.*

*   **Integração com a API do TMDb:**
    *   Criação de um serviço HTTP com o catálogo do TMDb (The Movie Database).
    *   Endpoints de catálogo criados: `GET /api/catalog/popular` e `GET /api/catalog/search` (pesquisa por texto).
*   **Publicação de Eventos Locais:**
    *   Desenvolvimento do endpoint `POST /api/events` exclusivo para usuários com o papel `ORGANIZADOR`.
    *   Lógica para o organizador passar o ID externo (`externalId`) de um filme e a API buscar a sinopse, título e imagem diretamente do TMDb, preenchendo automaticamente a criação do evento no banco de dados SQLite.

## 📅 Dia 3: Compra de Ingressos, Concorrência, Portaria & Documentação
*O terceiro dia foi focado em garantir a segurança transacional (não vender o mesmo assento duas vezes), simulação financeira e na documentação interativa para a banca avaliadora.*

*   **Lógica de Ingressos & Proteção de Concorrência (Race Conditions):**
    *   Uso de **Transações Atômicas e Isoladas (`prisma.$transaction`)** tipadas com o padrão estrito `Prisma.TransactionClient` para garantir que a verificação de capacidade máxima (`ticketsSold < capacity`), a geração do ingresso e a atualização do contador do evento aconteçam de forma indivisível.
*   **Simulação de Pagamento:**
    *   Ajuste no endpoint de reservas para aceitar métodos de pagamento simulados (`CREDIT_CARD`/`PIX`) e parâmetros para testar as duas pontas obrigatórias do edital: **Confirmação (`APROVADO`)** e **Recusa (`RECUSADO`)**.
    *   Lógica de *rollback* automático da transação em caso de pagamento recusado (não consumindo a vaga do evento).
*   **Portaria & Assinatura Digital Offline (HMAC):**
    *   Implementação do gerador de assinaturas digitais **HMAC-SHA256** combinando dados do ingresso com o segredo do servidor para criar o `secureHash` inviolável do QR Code.
    *   Criação do endpoint de validação na portaria (`POST /api/gate/validate`) retornando os 4 status exatos exigidos pelo edital: `VALID` (e alterando o status para `UTILIZADO`), `ALREADY_USED` (evita fraudes de cópia), `WRONG_EVENT` (aviso de local errado) e `INVALID` (assinatura corrompida).
    *   Criação do endpoint público `/api/tickets/share/:secureHash` para compartilhamento direto de voucher.
*   **Swagger UI:**
    *   Configuração inicial da documentação viva e interativa em `/api-docs` usando o Swagger, mapeando os 9 endpoints.

## 📅 Dia 4: Polimento & Ajustes
*O quarto dia foi dedicado a refinar a documentação, além de ajustar partes do código e lógica de negócio.*

*   **Polimento e ajustes do Código:**
    *   Ajustes de lógica e regras do código.
*   **Ajustes da Documentação:**
    *   Revisão completa e ajustes nas documentações do projeto.
    *   Substituição do `README.md` pela versão definitiva.
*   **Preparação de Seeds:**
    *   Preparação de Seeds para testes dos endpoints.