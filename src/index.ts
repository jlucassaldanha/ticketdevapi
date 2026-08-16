import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import catalogRouter from './routes/catalog.routes.js';
import eventRouter from './routes/event.routes.js';
import ticketRouter from './routes/ticket.routes.js';
import gateRouter from './routes/gate.routes.js';

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/catalog', catalogRouter)
app.use('/api/events', eventRouter)
app.use('/api/tickets', ticketRouter)
app.use('/api/gate', gateRouter)

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta:${PORT}`)
})