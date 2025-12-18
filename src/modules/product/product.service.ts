import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { isValidId, pagination } from '@/shared/helpers/utils';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RemoveImage } from './dto/remove-image.dto';
import slugify from 'slugify';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly cloudinaryService: CloudinaryService,
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

  async findAll(query: string, current: number, pageSize: number) {
    return pagination(this.productModel, query, +current, +pageSize, [
      'supplierId',
      { path: 'categoryId' },
    ]);
  }

  async findByShopId(_id: string) {
    if (!isValidId(_id)) {
      throw new BadRequestException('Id shop để get product không hợp lệ ');
    }
    const data = await this.productModel.find({ supplierId: _id });
    if (!data) {
      throw new BadRequestException('Lỗi khi lấy dữ liệu product theo shops');
    }
    return data;
  }

  async findByCategoryId(
    query: string,
    categoryId: string,
    current: number,
    pageSize: number,
  ) {
    const { filter, sort, projection } = aqp(query);
    console.log('check filter', filter);
    if (!current) current = 1;
    if (!pageSize) pageSize = 5;

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!isValidId(categoryId)) {
      throw new BadRequestException('Id category không hợp lệ');
    }

    const totalItems = await this.productModel.countDocuments({ categoryId });
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const result = await this.productModel
      .find({ categoryId })
      .skip(skip)
      .limit(pageSize)
      .populate(['supplierId', { path: 'categoryId' }]);

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
