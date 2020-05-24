import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface Request {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: Request): Promise<Category> {
    const categoryRepository = getRepository(Category);

    const selectedCategory = await categoryRepository.findOne({
      where: {
        title,
      },
    });

    const id = selectedCategory ? selectedCategory.id : undefined;

    const category = categoryRepository.create({
      title,
      id,
    });

    await categoryRepository.save(category);

    return category;
  }
}

export default CreateCategoryService;
