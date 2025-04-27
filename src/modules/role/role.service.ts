import { NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';

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

  findAll() {
    return `This action returns all role`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
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
