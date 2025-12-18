import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { RemoveImage } from '../product/dto/remove-image.dto';
import { isValidId } from '@/shared/helpers/utils';
import { InjectModel } from '@nestjs/mongoose';
import { Variant } from './schemas/variant.schema';
import { Product } from '../product/schemas/product.schema';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
@Injectable()
export class VariantService {
  constructor(
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateVariantDto, files: Express.Multer.File[]) {
    const { productId } = dto;

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new BadRequestException('Product không tồn tại');
    }

    let images = [];
    if (files && files.length > 0) {
      const uploaded = await this.cloudinaryService.uploadMultiFiles(files);
      images = uploaded.map((img) => ({
        public_id: img.public_id,
        secure_url: img.secure_url,
        width: img.width,
        height: img.height,
      }));
    }

    return this.variantModel.create({
      ...dto,
      images,
    });
  }

  async findByProduct(productId: string) {
    if (!isValidId(productId)) {
      throw new BadRequestException('ProductId không hợp lệ');
    }

    return this.variantModel.find({ productId });
  }

  async update(
    id: string,
    dto: UpdateVariantDto,
    files: Express.Multer.File[],
  ) {
    const variant = await this.variantModel.findById(id);
    if (!variant) {
      throw new NotFoundException('Variant không tồn tại');
    }

    let images = variant.images;

    if (files && files.length > 0) {
      const uploaded = await this.cloudinaryService.uploadMultiFiles(files);
      const newImages = uploaded.map((img) => ({
        public_id: img.public_id,
        secure_url: img.secure_url,
        width: img.width,
        height: img.height,
      }));
      images = [...images, ...newImages];
    }

    await this.variantModel.updateOne({ _id: id }, { ...dto, images });

    return { message: 'Update variant thành công' };
  }

  async remove(id: string) {
    const variant = await this.variantModel.findById(id);
    if (!variant) {
      throw new NotFoundException('Variant không tồn tại');
    }

    if (variant.images?.length) {
      const publicIds = variant.images.map((i) => i.public_id);
      await this.cloudinaryService.deleteFiles(publicIds);
    }

    return this.variantModel.deleteOne({ _id: id });
  }

  async removeImage(id: string, removeImage: RemoveImage) {
    const variant = await this.variantModel.findById(id);
    if (!variant) {
      throw new NotFoundException('Variant không tồn tại');
    }

    const exists = variant.images.find(
      (img) => img.public_id === removeImage.public_id,
    );
    if (!exists) {
      throw new BadRequestException('Ảnh không tồn tại');
    }

    await this.cloudinaryService.deleteFile(removeImage.public_id);

    const images = variant.images.filter(
      (img) => img.public_id !== removeImage.public_id,
    );

    await this.variantModel.updateOne({ _id: id }, { images });

    return { message: 'Xóa ảnh variant thành công' };
  }
}
