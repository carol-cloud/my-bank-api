import express from 'express';
import { promises as fs } from 'fs';

const router = express.Router();
const { readFile, writeFile } = fs;

router.post('/', async (req, res) => {
  try {
    //armazenando o body numa variável
    let account = req.body;
    //lendo o documento json que criamos
    const data = JSON.parse(await readFile('accounts.json'));

    //incrementando novo id
    account = { id: data.nextId++, ...account };
    data.accounts.push(account);

    //escrevendo o novo usuário no json
    await writeFile('accounts.json', JSON.stringify(data, null, 2));

    res.send(account);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});
export default router;
