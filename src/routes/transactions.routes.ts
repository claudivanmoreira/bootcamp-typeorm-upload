import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';
import multerConfig from '../config/multer';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import ListTransactionsService from '../services/ListTransactionsService';

const transactionsRouter = Router();
const upload = multer(multerConfig);

transactionsRouter.get('/', async (request, response) => {
  const listTransactionsService = new ListTransactionsService();
  const result = await listTransactionsService.execute();
  return response.json(result);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const transactionRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionRepository.getBalance();

  if (type === 'outcome' && value > balance.income) {
    throw new AppError('Saldo insuficiente para realizar a transação');
  }

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const deleteTransaction = new DeleteTransactionService();
  const { id } = request.params;
  await deleteTransaction.execute({ transactionId: id });
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('csvFile'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();

    await importTransactions.execute({
      csvFileName: request.file.filename,
    });

    return response.json({ ok: true });
  },
);

export default transactionsRouter;
