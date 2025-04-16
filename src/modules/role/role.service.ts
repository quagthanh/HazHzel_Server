import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class RoleService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}
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

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
