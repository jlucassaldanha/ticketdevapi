import express from 'express';
import basicRoutes from './routes/basicRoutes.js'

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use('/api', basicRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta:${PORT}`)
})