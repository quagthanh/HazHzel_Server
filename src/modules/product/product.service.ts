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

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
