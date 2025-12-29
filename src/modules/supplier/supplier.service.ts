import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Supplier } from './schemas/supplier.schema';
import { Model, Types } from 'mongoose';
import { isValidId, pagination } from '@/shared/helpers/utils';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Product } from '../product/schemas/product.schema';
import slugify from 'slugify';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  private checkSlugExist = async (slug: string): Promise<boolean> => {
    const isSlugExist = await this.supplierModel.exists({ slug });
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
    createSupplierDto: CreateSupplierDto,
    files: Express.Multer.File[] = [],
  ) {
    const { name, ...otherFields } = createSupplierDto;
    const slug = await this.generateSlugUnique(name);

    if (!files || files.length === 0) {
      throw new BadRequestException('Hãy chọn ít nhất 1 hình');
    }
    const uploadedImages = await this.cloudinaryService.uploadMultiFiles(files);
    const simplifiedImages = uploadedImages.map((img) => ({
      public_id: img.public_id,
      secure_url: img.secure_url,
      width: img.width,
      height: img.height,
    }));

    const newSupplier = await this.supplierModel.create({
      name,
      images: simplifiedImages,
      slug,
      ...otherFields,
    });

    return newSupplier;
  }
  async findAll(query: string, current: number, pageSize: number) {
    return pagination(this.supplierModel, query, current, pageSize);
  }

  async findAllForAdmin(query: string, current: number, pageSize: number) {
    return pagination(this.supplierModel, query, current, pageSize);
  }

  async findOne(_id: string) {
    if (!isValidId(_id)) {
      throw new BadRequestException('Id supplier không hợp lệdadw');
    }

    const supplier = await this.supplierModel.findById(_id);
    if (!supplier) {
      throw new NotFoundException('Không tìm thấy supplier');
    }

    return supplier;
  }
  async findIdBySlug(slug: string): Promise<Types.ObjectId> {
    const supplier = await this.supplierModel
      .findOne({ slug })
      .select('_id')
      .exec();

    if (!supplier) {
      throw new NotFoundException(`Supplier với slug "${slug}" không tồn tại.`);
    }

    return supplier._id;
  }
  async getTop3SuppliersByProductViews() {
    return await this.productModel.aggregate([
      // 1. Chỉ lấy product active (nếu có)
      {
        $match: {
          supplierId: { $exists: true },
        },
      },

      // 2. Group theo supplier
      {
        $group: {
          _id: '$supplierId',
          totalViews: { $sum: '$views' },
          totalProducts: { $sum: 1 },
        },
      },

      // 3. Sort theo views
      {
        $sort: { totalViews: -1 },
      },

      // 4. Join supplier
      {
        $lookup: {
          from: 'suppliers',
          localField: '_id',
          foreignField: '_id',
          as: 'supplier',
        },
      },

      { $unwind: '$supplier' },

      // 5. Chỉ lấy supplier ACTIVE
      {
        $match: {
          'supplier.status': 'ACTIVE',
        },
      },

      // 6. Limit top 3
      { $limit: 3 },

      // 7. Format response
      {
        $project: {
          _id: 0,
          supplierId: '$_id',
          totalViews: 1,
          totalProducts: 1,
          supplier: {
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
    updateSupplierDto: UpdateSupplierDto,
    files: Express.Multer.File[],
  ) {
    if (!isValidId(_id)) {
      throw new BadRequestException('Supplier Id is not valid');
    }

    const data = await this.supplierModel.findById(_id);
    if (!data) {
      throw new BadRequestException('Supplier have not been created yet');
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

    const result = await this.supplierModel.updateOne(
      { _id },
      { images: existingImages, ...updateSupplierDto },
    );

    return result;
  }
  async remove(_id: string) {
    if (!isValidId(_id)) {
      throw new BadRequestException('Id supplier không hợp lệ');
    }

    const supplier = await this.supplierModel.findById(_id);
    if (!supplier) {
      throw new NotFoundException('Không tìm thấy supplier');
    }

    return await this.supplierModel.deleteOne({ _id });
  }
}
