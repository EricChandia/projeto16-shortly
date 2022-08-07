import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRouter.js'
import shortenUrlRouter from './routes/shortenUrlRouter.js'
import rankingRouter from './routes/rankingRouter.js'

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


app.use(authRouter);
app.use(shortenUrlRouter);
app.use(rankingRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log('Servidor rodou deboas na porta ' + PORT));
