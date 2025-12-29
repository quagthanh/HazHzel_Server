import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Model, Types } from 'mongoose';
import aqp from 'api-query-params';
import {
  isValidId,
  pagination,
  paginationAggregate,
} from '@/shared/helpers/utils';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RemoveImage } from './dto/remove-image.dto';
import slugify from 'slugify';
import { Supplier } from '../supplier/schemas/supplier.schema';
import { SupplierService } from '../supplier/supplier.service';
import { CategoryService } from '../category/category.service';
import { CollectionService } from '../collection/collection.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly supplierService: SupplierService,
    private readonly categoryService: CategoryService,
    private readonly collectionService: CollectionService,
  ) {}

  private checkSlugExist = async (slug: string): Promise<boolean> => {
    const isSlugExist = await this.productModel.exists({ slug });
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
    createProductDto: CreateProductDto,
    files: Express.Multer.File[] = [],
  ) {
    const { name, ...otherFields } = createProductDto;
    const slug = await this.generateSlugUnique(name);
    if (files.length === 0) {
      throw new BadRequestException('Hãy chọn ít nhất 1 hình');
    }
    const uploadedImages = await this.cloudinaryService.uploadMultiFiles(files);
    const simplifiedImages = uploadedImages.map((img) => ({
      public_id: img.public_id,
      secure_url: img.secure_url,
      width: img.width,
      height: img.height,
    }));

    const newProduct = await this.productModel.create({
      images: simplifiedImages,
      name,
      slug,
      ...otherFields,
    });

    return newProduct;
  }

  async findAllForAdmin(query: string, current: number, pageSize: number) {
    return pagination(this.productModel, query, +current, +pageSize, [
      'supplierId',
      { path: 'categoryId' },
    ]);
  }
  async findAll(query: string, current: number, pageSize: number) {
    return paginationAggregate(this.productModel, query, current, pageSize, [
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
      {
        $unwind: {
          path: '$variants',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          'variants.currentPrice': 1,
        },
      },

      {
        $group: {
          _id: '$_id',
          doc: { $first: '$$ROOT' },
          cheapestVariant: { $first: '$variants' },
        },
      },

      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$doc',
              {
                originalPrice: '$cheapestVariant.originalPrice',
                discountPrice: '$cheapestVariant.discountPrice',
                currentPrice: '$cheapestVariant.currentPrice',
              },
            ],
          },
        },
      },

      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryId',
        },
      },
      {
        $unwind: {
          path: '$categoryId',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplierId',
        },
      },
      {
        $unwind: {
          path: '$supplierId',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          variants: 0,
          cheapestVariant: 0,
        },
      },
    ]);
  }

  async findBySupplier(
    supplierSlug: string,
    query: string,
    current: number,
    pageSize: number,
  ) {
    const supplierId = await this.supplierService.findIdBySlug(supplierSlug);

    return paginationAggregate(this.productModel, query, current, pageSize, [
      {
        $match: {
          supplierId: new Types.ObjectId(supplierId),
        },
      },
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
      {
        $unwind: {
          path: '$variants',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          'variants.currentPrice': 1,
        },
      },
      {
        $group: {
          _id: '$_id',
          doc: { $first: '$$ROOT' },
          cheapestVariant: { $first: '$variants' },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$doc',
              {
                originalPrice: '$cheapestVariant.originalPrice',
                discountPrice: '$cheapestVariant.discountPrice',
                currentPrice: '$cheapestVariant.currentPrice',
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryId',
        },
      },
      {
        $unwind: {
          path: '$categoryId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          variants: 0,
          cheapestVariant: 0,
        },
      },
    ]);
  }
  async findByCategory(
    categorySlug: string,
    query: string,
    current: number,
    pageSize: number,
  ) {
    const categoryId = await this.categoryService.findIdBySlug(categorySlug);

    return paginationAggregate(this.productModel, query, current, pageSize, [
      {
        $match: {
          categoryId: new Types.ObjectId(categoryId),
        },
      },
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
      {
        $unwind: {
          path: '$variants',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          'variants.currentPrice': 1,
        },
      },
      {
        $group: {
          _id: '$_id',
          doc: { $first: '$$ROOT' },
          cheapestVariant: { $first: '$variants' },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$doc',
              {
                originalPrice: '$cheapestVariant.originalPrice',
                discountPrice: '$cheapestVariant.discountPrice',
                currentPrice: '$cheapestVariant.currentPrice',
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryId',
        },
      },
      {
        $unwind: {
          path: '$categoryId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          variants: 0,
          cheapestVariant: 0,
        },
      },
    ]);
  }
  async findByCollection(
    collectionSlug: string,
    query: string,
    current: number,
    pageSize: number,
  ) {
    // Bước 1: Tìm _id của Collection dựa vào slug
    const collectionId =
      await this.collectionService.findIdBySlug(collectionSlug);

    // Bước 2: Chạy Pipeline
    return paginationAggregate(this.productModel, query, current, pageSize, [
      // A. Lọc sản phẩm thuộc Collection này
      {
        $match: {
          collectionId: new Types.ObjectId(collectionId),
        },
      },

      // B. (GIỮ NGUYÊN) Join với Variants để lấy giá
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
      {
        $unwind: {
          path: '$variants',
          preserveNullAndEmptyArrays: true,
        },
      },

      // C. (GIỮ NGUYÊN) Sắp xếp để lấy biến thể giá rẻ nhất lên đầu nhóm
      {
        $sort: {
          'variants.currentPrice': 1,
        },
      },

      // D. (GIỮ NGUYÊN) Group lại thành 1 sản phẩm
      {
        $group: {
          _id: '$_id',
          doc: { $first: '$$ROOT' },
          cheapestVariant: { $first: '$variants' },
        },
      },

      // E. (GIỮ NGUYÊN) Làm phẳng dữ liệu và gán giá hiển thị
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$doc',
              {
                originalPrice: '$cheapestVariant.originalPrice',
                discountPrice: '$cheapestVariant.discountPrice',
                currentPrice: '$cheapestVariant.currentPrice',
              },
            ],
          },
        },
      },

      // F. (QUAN TRỌNG) Vẫn Join với Category để hiển thị thẻ loại sản phẩm (Category Tag) ở Product Card
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryId',
        },
      },
      {
        $unwind: {
          path: '$categoryId',
          preserveNullAndEmptyArrays: true,
        },
      },

      // G. Cleanup dữ liệu thừa
      {
        $project: {
          variants: 0,
          cheapestVariant: 0,
        },
      },
    ]);
  }
  async findByProductSlug(slug: string) {
    const data = (await this.productModel.findOne({ slug: slug })).populate([
      'supplierId',
      { path: 'categoryId' },
    ]);
    if (!data) {
      throw new BadRequestException('Sản phẩm không hợp lệ');
    }
    return data;
  }
  async increaseProductView(slug: string): Promise<number> {
    return await this.productModel.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true },
    );
  }
  async update(
    _id: string,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
  ) {
    if (!isValidId(_id)) {
      throw new BadRequestException('Id sản phẩm để update không hợp lệ');
    }

    const data = await this.productModel.findById(_id);
    if (!data) {
      throw new BadRequestException('Không tìm thấy sản phẩm để update');
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

    const result = await this.productModel.updateOne(
      { _id },
      { images: existingImages, ...updateProductDto },
    );

    return result;
  }

  async remove(_id: string) {
    const data = await this.productModel.findById(_id);
    if (!data) {
      throw new BadRequestException('Không tìm thấy id sản phẩm ');
    }
    const id_image = data?.images.map((img) => img.public_id);
    await this.cloudinaryService.deleteFiles(id_image);
    return await this.productModel.deleteOne({ _id });
  }

  async removeImage(_id: string, removeImage: RemoveImage) {
    const { public_id } = removeImage;
    if (!isValidId(_id)) {
      throw new BadRequestException('Id sản phẩm không hợp lệ');
    }
    const product = await this.productModel.findById(_id);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    const imageExists = product.images.find(
      (img) => img.public_id === public_id,
    );
    if (!imageExists) {
      throw new BadRequestException('Ảnh không tồn tại trong sản phẩm');
    }
    await this.cloudinaryService.deleteFile(public_id);
    const updatedImages = product.images.filter(
      (img) => img.public_id !== public_id,
    );
    await this.productModel.updateOne({ _id: _id }, { images: updatedImages });
    return { message: 'Đã xóa ảnh thành công' };
  }

  // async removeImages(_id: string, removeImage: RemoveImage) {
  //   const { public_ids } = removeImage;

  //   if (!isValidId(_id)) {
  //     throw new BadRequestException('Id sản phẩm để remove image không hợp lệ');
  //   }

  //   const data = await this.productModel.findById(_id);
  //   if (!data) {
  //     throw new BadRequestException('Không tìm thấy sản phẩm để remove image');
  //   }

  //   const currentImages = data.images;

  //   // Giữ lại ảnh KHÔNG nằm trong danh sách cần xóa
  //   const remainingImages = currentImages.filter(
  //     (img) => !public_ids.includes(img.public_id),
  //   );

  //   // Xóa trên Cloudinary
  //   await this.cloudinaryService.deleteFiles(public_ids);

  //   // Cập nhật trong DB
  //   return await this.productModel.updateOne(
  //     { _id },
  //     { images: remainingImages },
  //   );
  // }
}
