import { NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import aqp from 'api-query-params';

export class RoleService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  isRoleExists = async (_id: string) => {
    const role = await this.roleModel.exists({ _id: new Types.ObjectId(_id) });
    if (!role) {
      throw new NotFoundException('Không tìm thấy role');
    }
    return !!role;
  };

  async create(createRoleDto: CreateRoleDto) {
    const { name, permissionId } = createRoleDto;
    const data = await this.roleModel.create({
      name: name,
      permissionsId: permissionId,
    });
    if (!data) {
      return 'Cannot create new role';
    }
    return data;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort, projection } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 5;

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    const totalItems = await this.roleModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const result = await this.roleModel
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

  findByName(name: string) {
    return this.roleModel.findOne({ name }).lean().exec();
  }
  findByIds(ids: string[]) {
    return this.roleModel
      .find({ _id: { $in: ids } })
      .lean()
      .exec();
  }

  async update(updateRoleDto: UpdateRoleDto) {
    const { _id, permissionId } = updateRoleDto;
    const isRoleExist = await this.isRoleExists(_id);
    if (!isRoleExist === true) {
      return;
    }
    const data = await this.roleModel.updateOne(
      { _id },
      { permissionsId: permissionId },
    );
    return data;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
