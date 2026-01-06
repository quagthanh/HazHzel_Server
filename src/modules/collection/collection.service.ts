import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Collection } from './schemas/collection.schema';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Product } from '../product/schemas/product.schema';
import slugify from 'slugify';
import { isValidId, pagination } from '@/shared/helpers/utils';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection.name)
    private readonly collectionModel: Model<Collection>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}
  private checkSlugExist = async (slug: string): Promise<boolean> => {
    const isSlugExist = await this.collectionModel.exists({ slug });
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
    createCollectionDto: CreateCollectionDto,
    files: Express.Multer.File[] = [],
  ) {
    const { name, ...otherFields } = createCollectionDto;
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

    const newCollection = await this.collectionModel.create({
      name,
      images: simplifiedImages,
      slug,
      ...otherFields,
    });

    return newCollection;
  }

  async findAll(query: string, current: number, pageSize: number) {
    return pagination(this.collectionModel, query, current, pageSize);
  }

  async findAllForAdmin(query: string, current: number, pageSize: number) {
    return pagination(this.collectionModel, query, current, pageSize);
  }

  async findOne(_id: string) {
    if (!isValidId(_id)) {
      throw new BadRequestException('Id collection không hợp lệ');
    }

    const collection = await this.collectionModel.findById(_id);
    if (!collection) {
      throw new NotFoundException('Không tìm thấy collection');
    }

    return collection;
  }

  async findIdBySlug(slug: string): Promise<Types.ObjectId> {
    const collection = await this.collectionModel
      .findOne({ slug })
      .select('_id')
      .exec();

    if (!collection) {
      throw new NotFoundException(
        `Collection với slug "${slug}" không tồn tại.`,
      );
    }

    return collection._id;
  }

  async searchByKeyword(keyword: string) {
    const regex = new RegExp(keyword, 'i');

    const collections = await this.collectionModel
      .find({
        name: { $regex: regex },
      })
      .select('name slug image')
      .limit(5)
      .lean();
    return collections;
  }
  async getTop3CollectionsByProductViews() {
    return await this.productModel.aggregate([
      {
        $match: {
          collectionId: { $exists: true },
        },
      },

      {
        $group: {
          _id: '$collectionId',
          totalViews: { $sum: '$views' },
          totalProducts: { $sum: 1 },
        },
      },

      {
        $sort: { totalViews: -1 },
      },

      {
        $lookup: {
          from: 'collections',
          localField: '_id',
          foreignField: '_id',
          as: 'collection',
        },
      },

      { $unwind: '$collection' },

      {
        $match: {
          'collection.status': 'ACTIVE',
        },
      },

      { $limit: 3 },

      {
        $project: {
          _id: 0,
          collectionId: '$_id',
          totalViews: 1,
          totalProducts: 1,
          collection: {
            name: 1,
            slug: 1,
            images: 1,
            description: 1,
            status: 1,
          },
        },
      },
    ]);
  }

  async update(
    _id: string,
    updateCollectionDto: UpdateCollectionDto,
    files: Express.Multer.File[],
  ) {
    if (!isValidId(_id)) {
      throw new BadRequestException('Collection Id is not valid');
    }

    const data = await this.collectionModel.findById(_id);
    if (!data) {
      throw new BadRequestException('Collection have not been created yet');
    }

    let existingImages = data.images;

    if (files && files.length > 0) {
      const uploadedImages =
        await this.cloudinaryService.uploadMultiFiles(files);
      const newImages = uploadedImages.map((img) => ({
        public_id: img.public_id,
        secure_url: img.secure_url,
        width: img.width,
        height: img.height,
      }));
      existingImages = [...existingImages, ...newImages];
    }

    const result = await this.collectionModel.updateOne(
      { _id },
      { images: existingImages, ...updateCollectionDto },
    );

    return result;
  }

  async remove(_id: string) {
    if (!isValidId(_id)) {
      throw new BadRequestException('Id collection không hợp lệ');
    }

    const collection = await this.collectionModel.findById(_id);
    if (!collection) {
      throw new NotFoundException('Không tìm thấy collection');
    }

    return await this.collectionModel.deleteOne({ _id });
  }
}
