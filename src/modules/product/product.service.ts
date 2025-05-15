import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import mongoose, { Model, Mongoose } from 'mongoose';
import aqp from 'api-query-params';
import { Supplier } from '../supplier/schemas/supplier.schema';
import { isValidId } from '@/shared/helpers/utils';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { categoryId, supplierId, ...ortherFields } = createProductDto;
    const data = await this.productModel.create({
      categoryId,
      supplierId,
      ...ortherFields,
    });
    return data;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort, projection } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 5;

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    const totalItems = await this.productModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const result = await this.productModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .select(projection)
      .sort(sort as any)
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
  async findOne(_id: string) {
    if (!isValidId(_id)) {
      throw new BadRequestException('Id product không hợp lệ ');
    }
    const data = await this.productModel
      .findById(_id)
      .populate(['supplierId', { path: 'categoryId' }]);
    if (!data) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return data;
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

  async update(_id: string, updateProductDto: UpdateProductDto) {
    const result = await this.productModel.updateOne(
      { _id },
      { ...updateProductDto },
    );
    return result;
  }

  async remove(_id: string) {
    return await this.productModel.deleteOne({ _id });
  }
}
