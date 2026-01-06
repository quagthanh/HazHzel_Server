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
import { SupplierService } from '../supplier/supplier.service';
import { CategoryService } from '../category/category.service';
import { CollectionService } from '../collection/collection.service';
import { GenderType } from '@/shared/enums/typeGenderProduct.enm';
import { VariantService } from '../variant/variant.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly supplierService: SupplierService,
    private readonly categoryService: CategoryService,
    private readonly collectionService: CollectionService,
    private readonly variantService: VariantService,
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
    const queryParams = new URLSearchParams(query);
    const gender = queryParams.get('gender');

    const customMatchStage: any = {};

    if (gender) {
      if (gender === GenderType.MEN) {
        customMatchStage.gender = { $in: [GenderType.MEN, GenderType.UNISEX] };
      } else if (gender === GenderType.WOMEN) {
        customMatchStage.gender = {
          $in: [GenderType.WOMEN, GenderType.UNISEX],
        };
      } else {
        customMatchStage.gender = gender;
      }

      queryParams.delete('gender');
    }
    const cleanQuery = queryParams.toString();

    const pipeline = [
      ...(Object.keys(customMatchStage).length > 0
        ? [{ $match: customMatchStage }]
        : []),

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
        $project: {
          variants: 0,
        },
      },
    ];

    return paginationAggregate(
      this.productModel,
      cleanQuery,
      current,
      pageSize,
      pipeline,
    );
  }
  async findBySupplier(
    supplierSlug: string,
    query: string,
    current: number,
    pageSize: number,
  ) {
    const supplierId = await this.supplierService.findIdBySlug(supplierSlug);

    const queryParams = new URLSearchParams(query);
    const categorySlug = queryParams.get('category');
    const size = queryParams.get('size');
    const minPrice = queryParams.get('minPrice');
    const maxPrice = queryParams.get('maxPrice');
    const sort = queryParams.get('sort');

    const productMatchStage: any = {
      supplierId: new Types.ObjectId(supplierId),
    };

    if (categorySlug) {
      const categoryId = await this.categoryService.findIdBySlug(categorySlug);
      if (categoryId) {
        productMatchStage.categoryId = new Types.ObjectId(categoryId);
      }
    }

    const variantMatchStage: any = {};

    if (minPrice || maxPrice) {
      variantMatchStage['variants.currentPrice'] = {};
      if (minPrice)
        variantMatchStage['variants.currentPrice'].$gte = Number(minPrice);
      if (maxPrice)
        variantMatchStage['variants.currentPrice'].$lte = Number(maxPrice);
    }

    if (size) {
      variantMatchStage['variants.attributes'] = {
        $elemMatch: { k: 'Size', v: size },
      };
    }

    let sortStage: any = { 'variants.currentPrice': 1 };
    if (sort) {
      if (sort === 'price-desc') sortStage = { 'variants.currentPrice': -1 };
      else if (sort === 'price-asc') sortStage = { 'variants.currentPrice': 1 };
    }

    queryParams.delete('category');
    queryParams.delete('size');
    queryParams.delete('minPrice');
    queryParams.delete('maxPrice');
    queryParams.delete('sort');
    queryParams.delete('inStock');

    const cleanQuery = queryParams.toString();

    return paginationAggregate(
      this.productModel,
      cleanQuery,
      current,
      pageSize,
      [
        {
          $match: productMatchStage,
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
            preserveNullAndEmptyArrays: false,
          },
        },
        ...(Object.keys(variantMatchStage).length > 0
          ? [{ $match: variantMatchStage }]
          : []),

        {
          $sort: sortStage,
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
          },
        },
      ],
    );
  }
  async findHomeNewBrand(
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
        $project: {
          variants: 0,
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

    const queryParams = new URLSearchParams(query);
    const size = queryParams.get('size');
    const minPrice = queryParams.get('minPrice');
    const maxPrice = queryParams.get('maxPrice');
    const sort = queryParams.get('sort');
    const brandSlug = queryParams.get('brand');

    const productMatchStage: any = {
      categoryId: new Types.ObjectId(categoryId),
    };

    if (brandSlug) {
      const supplierId = await this.supplierService.findIdBySlug(brandSlug);
      if (supplierId) {
        productMatchStage.supplierId = new Types.ObjectId(supplierId);
      }
    }

    const variantMatchStage: any = {};

    if (minPrice || maxPrice) {
      variantMatchStage['variants.currentPrice'] = {};
      if (minPrice)
        variantMatchStage['variants.currentPrice'].$gte = Number(minPrice);
      if (maxPrice)
        variantMatchStage['variants.currentPrice'].$lte = Number(maxPrice);
    }

    if (size) {
      variantMatchStage['variants.attributes'] = {
        $elemMatch: { k: 'Size', v: size },
      };
    }

    let sortStage: any = { 'variants.currentPrice': 1 };
    if (sort) {
      if (sort === 'price-desc') sortStage = { 'variants.currentPrice': -1 };
      else if (sort === 'price-asc') sortStage = { 'variants.currentPrice': 1 };
    }

    queryParams.delete('size');
    queryParams.delete('minPrice');
    queryParams.delete('maxPrice');
    queryParams.delete('sort');
    queryParams.delete('brand');

    const cleanQuery = queryParams.toString();

    return paginationAggregate(
      this.productModel,
      cleanQuery,
      current,
      pageSize,
      [
        {
          $match: productMatchStage,
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
            preserveNullAndEmptyArrays: false,
          },
        },

        ...(Object.keys(variantMatchStage).length > 0
          ? [{ $match: variantMatchStage }]
          : []),

        {
          $sort: sortStage,
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
          },
        },
      ],
    );
  }
  async findByCollection(
    collectionSlug: string,
    query: string,
    current: number,
    pageSize: number,
  ) {
    const collectionId =
      await this.collectionService.findIdBySlug(collectionSlug);

    const queryParams = new URLSearchParams(query);
    console.log('Check query params:', queryParams.toString());
    const size = queryParams.get('size');
    const minPrice = queryParams.get('minPrice');
    const maxPrice = queryParams.get('maxPrice');
    const sort = queryParams.get('sort');
    const brandSlug = queryParams.get('brand');

    const productMatchStage: any = {
      collectionId: new Types.ObjectId(collectionId),
    };

    if (brandSlug) {
      const supplierId = await this.supplierService.findIdBySlug(brandSlug);
      if (supplierId) {
        productMatchStage.supplierId = new Types.ObjectId(supplierId);
      }
    }

    const variantMatchStage: any = {};

    if (minPrice || maxPrice) {
      variantMatchStage['variants.currentPrice'] = {};
      if (minPrice)
        variantMatchStage['variants.currentPrice'].$gte = Number(minPrice);
      if (maxPrice)
        variantMatchStage['variants.currentPrice'].$lte = Number(maxPrice);
    }

    if (size) {
      variantMatchStage['variants.attributes'] = {
        $elemMatch: { k: 'Size', v: size },
      };
    }

    let sortStage: any = { 'variants.currentPrice': 1 };
    if (sort) {
      if (sort === 'price-desc') sortStage = { 'variants.currentPrice': -1 };
      else if (sort === 'price-asc') sortStage = { 'variants.currentPrice': 1 };
    }

    queryParams.delete('size');
    queryParams.delete('minPrice');
    queryParams.delete('maxPrice');
    queryParams.delete('sort');
    queryParams.delete('brand');

    const cleanQuery = queryParams.toString();

    return paginationAggregate(
      this.productModel,
      cleanQuery,
      current,
      pageSize,
      [
        {
          $match: productMatchStage,
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
            preserveNullAndEmptyArrays: false,
          },
        },

        ...(Object.keys(variantMatchStage).length > 0
          ? [{ $match: variantMatchStage }]
          : []),

        {
          $sort: sortStage,
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
          },
        },
      ],
    );
  }
  async findByProductSlug(slug: string) {
    const product = await this.productModel
      .findOne({ slug: slug })
      .populate(['supplierId', { path: 'categoryId' }])
      .lean();
    if (!product) {
      throw new BadRequestException('Can not find product');
    }
    const variants = await this.variantService.findByProduct(product._id);
    if (!variants) {
      throw new BadRequestException('Can not find data');
    }
    return {
      ...product,
      variants: variants || [],
    };
  }
  async searchByKeyword(keyword: string) {
    const regex = new RegExp(keyword, 'i');

    return this.productModel.aggregate([
      {
        $match: {
          name: { $regex: regex },
          status: 'ACTIVE',
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
        $addFields: {
          cheapestVariant: { $arrayElemAt: ['$variants', 0] },
        },
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          images: { $slice: ['$images', 1] },
          price: '$cheapestVariant.currentPrice',
          supplier: '$supplier.name',
        },
      },
    ]);
  }
  async findTopViewed(limit: number = 10) {
    return this.productModel.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $sort: { views: -1 } },
      { $limit: limit },

      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
      {
        $addFields: {
          cheapestVariant: { $arrayElemAt: ['$variants', 0] },
        },
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          views: 1,
          images: { $slice: ['$images', 1] },
          price: '$cheapestVariant.currentPrice',
          supplier: '$supplier.name',
        },
      },
    ]);
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
