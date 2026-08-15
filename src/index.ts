import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import catalogRouter from './routes/catalog.routes.js';

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/catalog', catalogRouter)

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta:${PORT}`)
})