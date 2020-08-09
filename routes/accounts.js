import express from 'express';
import { promises as fs } from 'fs';

const router = express.Router();
const { readFile, writeFile } = fs;

//usando o POST para passar informação, nesse caso de um novo usuário
router.post('/', async (req, res) => {
  try {
    //armazenando o body numa variável
    let account = req.body;
    //lendo o documento json que criamos
    const data = JSON.parse(await readFile(global.fileName));

    //incrementando novo id
    account = { id: data.nextId++, ...account };
    data.accounts.push(account);

    //escrevendo o novo usuário no json
    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(account);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//usando o GET para retornar informação para o usuário
//mas ele retorna todos os usuários
router.get('/', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    // deletando pro usuário o nextId
    delete data.nextId;
    // mostrando todos os usuários
    res.send(data);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//retornando apenas um usuário
router.get('/:id', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    // procurando apenas o id que passamos como parametro
    const account = data.accounts.find(
      // lembrando de usar o parseInt para converter a string
      (account) => account.id === parseInt(req.params.id)
    );
    //retornando o usuário
    res.send(account);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// usando DELETE
router.delete('/:id', async (req, res) => {
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
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});
export default router;
