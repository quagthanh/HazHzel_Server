import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from './schemas/permission.schema';
import { Model } from 'mongoose';

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

  findAll() {
    return `This action returns all permission`;
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
