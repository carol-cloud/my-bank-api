import express from 'express';
//importando rotas
import accountsRouter from './routes/accounts.js';
//biblioteca para criar arquivo json
import { promises as fs } from 'fs';
//biblioteca para tratamento de erros
import winston from 'winston';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './doc.js';

const { readFile, writeFile } = fs;
//como essa variável está sendo usada em vários arquivos, vamos globalizá-la
global.fileName = 'accounts.json';

// criando o arquivo de erros com o Winston
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'my-bank-api.log' }),
  ],
  format: combine(label({ label: 'my-bank-api' }), timestamp(), myFormat),
});

const app = express();
app.use(express.json());
// declarar cors antes das rotas
app.use(cors());
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/account', accountsRouter);

app.listen(3000, async () => {
  try {
    await readFile(global.fileName);
    logger.info('API Started!');
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };
    writeFile(global.fileName, JSON.stringify(initialJson))
      .then(() => {
        logger.info('API Started and file created!');
      })
      .catch((err) => {
        logger.error(err);
      });
  }
});
