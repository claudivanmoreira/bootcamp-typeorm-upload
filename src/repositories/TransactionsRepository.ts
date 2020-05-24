import { EntityRepository, getRepository, Repository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transacttionRepository = getRepository(Transaction);

    const result = await transacttionRepository.query(
      'with ' +
        ' outcomes as  ( select coalesce(sum(value), 0) as total_outcome from transactions where type = $1 ), ' +
        ' incomes as ( select coalesce(sum(value), 0) as total_income from transactions where type = $2 ) ' +
        ' select outcomes.total_outcome, incomes.total_income from outcomes, incomes',
      ['outcome', 'income'],
    );

    const outcome = result[0].total_outcome;
    const income = result[0].total_income;
    const total = income - outcome;

    const balance: Balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
