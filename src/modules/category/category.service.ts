import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schemas/category.schema';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';
import aqp from 'api-query-params';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private readonly cloudinaryService: CloudinaryService,
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
  async create(
    createCategoryDto: CreateCategoryDto,
    files: Express.Multer.File[] = [],
  ) {
    const { name, ...otherFields } = createCategoryDto;
    const slug = await this.generateSlugUnique(name);
    if (!files || files.length === 0) {
      throw new BadRequestException('Hãy chọn ít nhất 1 hình');
    }

    let simplifiedImages = [];
    if (files.length > 0) {
      const uploadedImages =
        await this.cloudinaryService.uploadMultiFiles(files);
      simplifiedImages = uploadedImages.map((img) => ({
        public_id: img.public_id,
        secure_url: img.secure_url,
        width: img.width,
        height: img.height,
      }));
    }
    const newCategory = await this.categoryModel.create({
      name,
      images: simplifiedImages,
      slug,
      ...otherFields,
    });
    return newCategory;
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
  async findIdBySlug(slug: string): Promise<Types.ObjectId> {
    const category = await this.categoryModel
      .findOne({ slug })
      .select('_id')
      .exec();

    if (!category) {
      throw new NotFoundException(`Category với slug "${slug}" không tồn tại.`);
    }

    return category._id;
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
