import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schemas/category.schema';
import { Model } from 'mongoose';
import slugify from 'slugify';
import aqp from 'api-query-params';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}
  private checkSlugExist = async (slug: string): Promise<boolean> => {
    const isSlugExist = await this.categoryModel.exists({ slug });
    return !!isSlugExist;
  };
  private generateSlugUnique = async (text: string): Promise<string> => {
    let baseSlug = slugify(text, {
      replacement: '-',
      trim: true,
      lower: true,
      locale: 'vi',
    });
    let slug = baseSlug;
    let count = 1;
    while (await this.checkSlugExist(slug)) {
      slug = `${baseSlug}-${count++}`;
    }

    return slug;
  };
  async create(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;
    const slug = await this.generateSlugUnique(name);

    return await this.categoryModel.create({ name, slug: slug });
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort, projection } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 5;

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    const totalItems = await this.categoryModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;
    const baseProjection = projection;
    const result = await this.categoryModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .select(baseProjection)
      .sort(sort as any);
    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }
  async findByName(name: string) {
    return this.categoryModel
      .find({
        name: { $regex: name, $options: 'i' },
      })
      .collation({ locale: 'vi', strength: 1 })
      .lean();
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
