import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionList {
  transactions: Transaction[];
  balance: Balance;
}

class ListTransactionsService {
  public async execute(): Promise<TransactionList> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const transactions = await transactionRepository.find({
      relations: ['category'],
    });

    const balance = await transactionRepository.getBalance();

    const resultado: TransactionList = {
      transactions,
      balance,
    };

    return resultado;
  }
}

export default ListTransactionsService;
