import express from 'express';
//importando rotas
import accountsRouter from './routes/accounts.js';
//biblioteca para criar arquivo json
import { promises as fs } from 'fs';

const { readFile, writeFile } = fs;
//como essa variável está sendo usada em vários arquivos, vamos globalizá-la
global.fileName = 'accounts.json';

const app = express();
app.use(express.json());

app.use('/account', accountsRouter);

app.listen(3000, async () => {
  try {
    await readFile(global.fileName);
    console.log('API Started!');
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };
    writeFile(global.fileName, JSON.stringify(initialJson))
      .then(() => {
        console.log('API Started and file created!');
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
