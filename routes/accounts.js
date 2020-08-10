import express from 'express';
import { promises as fs } from 'fs';
import winston from 'winston';

const router = express.Router();
const { readFile, writeFile } = fs;

//usando o POST para passar informação, nesse caso de um novo usuário
router.post('/', async (req, res, next) => {
  try {
    //armazenando o body numa variável
    let account = req.body;

    //validando os campos name e balance
    if (!account.name || account.balance == null) {
      throw new Error('Name e Balance são obrigatórios');
    }
    //lendo o documento json que criamos
    const data = JSON.parse(await readFile(global.fileName));

    //incrementando novo id
    //incrementando dessa forma não permitimos que campos aleatórios sejam criados
    account = {
      id: data.nextId++,
      name: account.name,
      balance: account.balance,
    };
    data.accounts.push(account);

    //escrevendo o novo usuário no json
    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(account);

    logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

//usando o GET para retornar informação para o usuário
//mas ele retorna todos os usuários
router.get('/', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    // deletando pro usuário o nextId
    delete data.nextId;
    // mostrando todos os usuários
    res.send(data);
    logger.info('GET /account');
  } catch (err) {
    next(err);
  }
});

//retornando apenas um usuário
router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    // procurando apenas o id que passamos como parametro
    const account = data.accounts.find(
      // lembrando de usar o parseInt para converter a string
      (account) => account.id === parseInt(req.params.id)
    );
    //retornando o usuário
    res.send(account);
    logger.info('GET /account/:id');
  } catch (err) {
    next(err);
  }
});

// usando DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    //lendo o arquivo json
    const data = JSON.parse(await readFile(global.fileName));
    //filtrando e retirando o id que passamos
    //lembrando que temos que armazenar numa variável os dados filtrados
    data.accounts = data.accounts.filter(
      (account) => account.id !== parseInt(req.params.id)
    );

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.end();
    logger.info(`DELETE /account/:id - ${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

//usando PUT (atualização de todos os recursos)
router.put('/', async (req, res, next) => {
  try {
    const account = req.body;

    // validando campos no PUT
    if (!account.id || !account.name || account.balance == null) {
      throw new Error('Id, Name e Balance são obrigatórios');
    }
    //encontrando o usuário e alterando todos os dados
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex((a) => a.id === account.id);

    // verificando se o index existe
    if (index === -1) {
      throw new Error('Registro não encontrado');
    }
    data.accounts[index].name = account.name;
    data.accounts[index].balance = account.balance;

    //escrevendo o arquivo com as atualizações
    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    //mostrando pro usuário que foi alterado com sucesso
    res.send(account);
    logger.info(`PUT /account - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

//usando PATCH (atualização parcial de recurso)
router.patch('/updateBalance', async (req, res, next) => {
  try {
    const account = req.body;
    //encontrando o usuário e alterando dados
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex((a) => a.id === account.id);

    if (!account.id || account.balance == null) {
      throw new Error('Id e Balance são obrigatórios');
    }
    if (index === -1) {
      throw new Error('Registro não encontrado');
    }

    data.accounts[index].balance = account.balance;

    //escrevendo o arquivo com a atualização do balance
    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    //mostrando pro usuário que foi alterado com sucesso
    res.send(data.accounts[index]);
    logger.info(`PATCH /account/updateBalance - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

//tratamento de erros
//função de tratamento de erro e aplicando em todos os catch's anteriores
router.use((err, req, res, next) => {
  global.logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});
export default router;
