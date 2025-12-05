import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InternalCreateUser } from './dto/internal-create-user.dto';
import { RoleEnum } from '@/shared/enums/role.enum';
import { UsersService } from '../users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from '../role/schemas/role.schema';
import { Model, Types } from 'mongoose';
import { hashPassword, pickHighestRole } from '@/shared/helpers/utils';
import { CREATE_MATRIX } from '@/shared/constants/create_policy';
import { User } from '../users/schemas/user.schema';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import aqp from 'api-query-params';

import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    private readonly mailerService: MailerService,

    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  async handleRegister(
    internalRegisterDto: InternalCreateUser,
    callerRoles: RoleEnum[],
  ) {
    const { email, name, password, roles: createRoles } = internalRegisterDto;

    const checkEmail = await this.usersService.isEmailExist(email);
    if (checkEmail) {
      throw new BadRequestException('Tài khoản đã tồn tại');
    }
    //role of the creator
    const targetRoles = await this.roleModel.find({
      _id: { $in: callerRoles },
    });
    const targetRolesEnum = targetRoles.map((role) => role.name as RoleEnum);
    const callerRole = pickHighestRole(targetRolesEnum);
    for (const targetRE of targetRolesEnum) {
      if (!CREATE_MATRIX[callerRole].includes(targetRE)) {
        throw new ForbiddenException(
          'Bạn không đủ quyền để tạo tài khoản với vai trò này',
        );
      }
    }
    const hashPasswordForRegister = await hashPassword(password);
    const codeId = uuidv4();
    const user = await this.userModel.create({
      name,
      email,
      password: hashPasswordForRegister,
      codeId,
      roles: createRoles.map((id) => new Types.ObjectId(id)),
      codeExpired: dayjs().add(3, 'minutes'),
    });
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Kích hoạt tài khoản của bạn',
      template: './register',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    });
    return { _id: user._id };
  }
  async findAll(
    query: string,
    current: number,
    pageSize: number,
    callerRoles: RoleEnum[],
  ) {
    const { filter, sort, projection } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 5;

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    const targetRoles = await this.roleModel.find({
      _id: { $in: callerRoles },
    });
    const targetRolesEnum = targetRoles.map((role) => role.name as RoleEnum);
    const callerRole = pickHighestRole(targetRolesEnum);

    if (callerRole === RoleEnum.ADMIN) {
      const adminRoles = await this.roleModel.find({
        name: { $in: [RoleEnum.ADMIN, RoleEnum.CUSTOMER] },
      });
      filter.roles = { $in: adminRoles.map((r) => r._id) };
    }

    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const baseProjection = { password: 0 };
    const finalProjection = projection
      ? { ...projection, ...baseProjection }
      : baseProjection;

    const result = await this.userModel
      .find(filter)
      .select(baseProjection)
      .skip(skip)
      .limit(pageSize)
      .sort(sort as any);

    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }
}
