import express from 'express';
import basicRoutes from './routes/basicRoutes.js'
import cors from 'cors';
import authRouter from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta:${PORT}`)
})