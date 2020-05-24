import { EntityRepository, getRepository, Repository } from 'typeorm';
import Category from '../models/Category';

@EntityRepository(Category)
class CategoryRepository extends Repository<Category> {
  public async findByTitle(categoriesTitle: string[]): Promise<Category[]> {
    const categories: Category[] = await getRepository(Category)
      .createQueryBuilder('category')
      .select('category.id, category.title')
      .where('category.title in (:...categoriesTitle)', {
        categoriesTitle,
      })
      .execute();

    return categories;
  }
}

export default CategoryRepository;
