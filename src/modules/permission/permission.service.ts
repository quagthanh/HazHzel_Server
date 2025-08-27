import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from './schemas/permission.schema';
import mongoose, { Model, Mongoose } from 'mongoose';
import aqp from 'api-query-params';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Resources } from '@/shared/enums/resources.enum';

export class PermissionService {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto) {
    const { resource, action } = createPermissionDto;
    const data = await this.permissionModel.create({
      resource: resource,
      action: action,
    });
    if (!data) {
      return 'Error while creating new permission';
    }
    return data;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort, projection } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 5;

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    const totalItems = await this.permissionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const result = await this.permissionModel
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

  findOne(_id: string) {
    return this.permissionModel.findById({ _id });
  }

  async findByResource(resource: Resources): Promise<Permission> {
    const perm = await this.permissionModel.findOne({ resource }).lean();
    if (!perm) {
      throw new NotFoundException(
        `Permission for resource ${resource} not found`,
      );
    }
    return perm;
  }
  async upsert(resource: Resources, action: Partial<Permission['action']>) {
    return this.permissionModel.findOneAndUpdate(
      { resource },
      { $set: { action } },
      { new: true, upsert: true },
    );
  }
  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return this.permissionModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('Lỗi xảy ra khi xóa ');
    }
  }
}
