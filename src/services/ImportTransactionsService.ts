import parse from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';
import { getCustomRepository, getRepository } from 'typeorm';
import multerConfig from '../config/multer';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import CategoryRepository from '../repositories/CategoryRepository';

interface Request {
  csvFileName: string;
}

interface CsvRequest {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ csvFileName }: Request): Promise<Transaction[]> {
    const csvTransactions = await this.parseCsvFile({ csvFileName });

    if (!csvTransactions) {
      return [];
    }

    const categories = await this.resolveCategories(csvTransactions);

    console.log('execute 1 => ', categories);

    const transactionRepository = getRepository(Transaction);

    const transactions = csvTransactions.map(csvItem => {
      const { title, type, value } = csvItem;
      // console.log(title);
      console.log(categories.get(title));
      // const transaction = transactionRepository.create({
      //   title,
      //   value,
      //   type,
      //   category: categories.get(title),
      //   category_id: categories.get(title)?.id,
      // });
      // return transaction;
      return null;
    });

    // await transactionRepository.save(transactions);

    return []; // transactions;
  }

  private async parseCsvFile({ csvFileName }: Request): Promise<CsvRequest[]> {
    const filePath = path.resolve(multerConfig.csvFolder, csvFileName);

    const fileContent = await fs.promises.readFile(filePath);

    const csvRecords: CsvRequest[] = parse(fileContent, {
      delimiter: ',',
      columns: true,
      skip_empty_lines: true,
    });

    return csvRecords;
  }

  private async resolveCategories(
    csvTransactions: CsvRequest[],
  ): Promise<Map<string, Category>> {
    const categoriesTitle = Array.from(
      new Set(csvTransactions.map(transaction => transaction.category)),
    );

    const categoryRepository = getCustomRepository(CategoryRepository);

    // Recupera as categorias cadastradas com os titulos
    const categories = await categoryRepository.findByTitle(categoriesTitle);

    const categoriasCadastradas = categories.map(category => {
      return category.title;
    });

    // Recupera as categorias no .csv que nao estao cadastradas
    const categoriasInexistentes = categoriesTitle.filter(
      categoryTitle => !categoriasCadastradas.includes(categoryTitle),
    );

    // Cadastra as novas categorias
    if (categoriasInexistentes) {
      const newCategories = categoriasInexistentes.map(categoryTitle => {
        return categoryRepository.create({
          title: categoryTitle,
        });
      });

      await categoryRepository.save(newCategories);

      newCategories.forEach(category =>
        categories.push({ id: category.id, title: category.title }),
      );
    }

    const mapCategories = new Map();
    categories.forEach(category => {
      mapCategories.set(category.title, category);
    });

    return mapCategories;
  }
}

export default ImportTransactionsService;
