import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { RemoveImage } from '../product/dto/remove-image.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Variant } from './schemas/variant.schema';
import { Product } from '../product/schemas/product.schema';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
const generateUniqueKey = (attrs: any[]) => {
  return attrs
    .map((a) => ({ k: a.k.toLowerCase(), v: a.v.toLowerCase() }))
    .sort((a, b) => a.k.localeCompare(b.k))
    .map((a) => `${a.k}-${a.v}`)
    .join('-');
};
@Injectable()
export class VariantService {
  constructor(
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private cloudinaryService: CloudinaryService,
  ) {}
  async create(
    createVariantDto: CreateVariantDto,
    files: Express.Multer.File[],
  ) {
    let { productId, attributes, originalPrice, currentPrice, sku } =
      createVariantDto;
    if (typeof attributes === 'string') {
      try {
        attributes = JSON.parse(attributes);
      } catch (e) {
        throw new BadRequestException('Format attributes không hợp lệ');
      }
    }
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new BadRequestException('Product không tồn tại');
    }
    const existingVariants = await this.variantModel.find({ productId }).lean();

    const newVariantKey = generateUniqueKey(attributes);

    const isDuplicateAttribute = existingVariants.some((variant) => {
      const currentKey = generateUniqueKey(variant.attributes);
      return currentKey === newVariantKey;
    });

    if (isDuplicateAttribute) {
      throw new BadRequestException(
        `This variant (Attributes: ${newVariantKey}) is exist`,
      );
    }
    if (!sku) {
      const suffix = newVariantKey;
      sku = `${product.slug}-${suffix}`.toUpperCase();
    }

    const duplicateSku = await this.variantModel.findOne({ sku });
    if (duplicateSku) {
      throw new BadRequestException(`SKU ${sku} is exist`);
    }
    const nameSuffix = Array.isArray(attributes)
      ? attributes.map((attr: any) => attr.v).join(' - ')
      : '';
    const variantName = `${product.name} - ${nameSuffix}`;
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

    const newVariant = new this.variantModel({
      ...createVariantDto,
      productId,
      attributes,
      name: variantName,
      images,
      currentPrice: currentPrice || originalPrice,
    });

    return await newVariant.save();
  }

  async findByProduct(productId: Types.ObjectId) {
    const variants = await this.variantModel.find({ productId: productId });
    return variants;
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
