import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { hashPassword, pickHighestRole } from '@/shared/helpers/utils';
import aqp from 'api-query-params';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import {
  ChangePasswordDto,
  CodeAuthDto,
  RetryCodeDto,
  RetryPasswordDto,
} from '@/auth/dto/checkcode-auth.dto';
import { RoleEnum } from '@/shared/enums/role.enum';
import { Role } from '../role/schemas/role.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}
  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });

    return !!user;
  };
  async create(createUserDto: CreateUserDto) {
    //hash password
    const { name, email, password, phone, address, image } = createUserDto;
    const isExist = await this.isEmailExist(email);
    if (isExist === true) {
      throw new BadRequestException('Email đã tồn tại');
    }
    const hashPasswordForRegister = await hashPassword(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPasswordForRegister,
      phone,
      address,
      image,
    });
    return user;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort, projection } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 5;

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const baseProjection = { password: 0 };
    const finalProjection = projection
      ? { ...projection, baseProjection }
      : baseProjection;

    const result = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
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
    return this.userModel.findOne({ _id });
  }
  async findByEmail(email: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new NotFoundException('Email không tồn tại');
      }
      return user;
    } catch {
      throw new BadRequestException('Lỗi khi fetch thông tin user bằng email');
    }
  }
  async update(updateUserDto: UpdateUserDto) {
    const { _id, ...remain } = updateUserDto;
    const result = await this.userModel.updateOne({ _id }, { ...remain });
    return { result, ...remain };
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('Lỗi xảy ra khi xóa ');
    }
  }
  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;
    const customerRole = RoleEnum.CUSTOMER;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException('Email đã tồn tại');
    }
    const hashPasswordForRegister = await hashPassword(password);
    const codeId = uuidv4();
    const user = await this.userModel.create({
      name,
      email,
      password: hashPasswordForRegister,
      codeId,
      roles: [customerRole],
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

  async handleActive(codeDto: CodeAuthDto) {
    const { _id, code } = codeDto;
    const data = await this.userModel.findOne({ _id: _id, codeId: code });
    if (!data) {
      throw new BadRequestException({
        message: 'Mã code không hợp lệ hoặc đã hết hạn ',
      });
    }
    //check code's expired
    const isBeforeCheck = dayjs().isBefore(data.codeExpired);
    if (isBeforeCheck) {
      await this.userModel.updateOne({ _id: data._id }, { isActive: true });
    } else {
      throw new BadRequestException({
        message: 'Mã code không hợp lệ hoặc đã hết hạn ',
      });
    }
    return { isBeforeCheck };
  }
  async retryActive(retryCodeDto: RetryCodeDto) {
    const { email } = retryCodeDto;
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new BadRequestException('Tài khoản không tồn tại');
      }
      if (user.isActive) {
        throw new BadRequestException('Tài khoản đã được kích hoạt');
      }
      const codeId = uuidv4();
      if (!codeId) {
        throw new BadRequestException('Tạo code kích hoạt lại thất bại');
      }
      await this.userModel.updateOne(
        { _id: user._id },
        { codeId: codeId, codeExpired: dayjs().add(3, 'minutes') },
      );
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Kích hoạt lại tài khoản của bạn',
        template: './reactive',
        context: {
          name: user?.name ?? user.email,
          activationCode: codeId,
        },
      });
      return { _id: user._id };
    } catch {
      throw new BadRequestException('Tài khoản không tồn tại/hợp lệ');
    }
  }
  async retryPassword(retryPasswordDto: RetryPasswordDto) {
    const { email } = retryPasswordDto;
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new BadRequestException('Tài khoản không tồn tại');
      }
      if (user.isActive === false) {
        throw new BadRequestException('Tài khoản chưa được kích hoạt');
      }
      const codeId = uuidv4();
      if (!codeId) {
        throw new BadRequestException('Tạo code kích hoạt lại thất bại');
      }
      await this.userModel.updateOne(
        { _id: user._id },
        { codeId: codeId, codeExpired: dayjs().add(3, 'minutes') },
      );
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Thay đổi mật khẩu AccoutFreak',
        template: './register',
        context: {
          name: user?.name ?? user.email,
          activationCode: codeId,
        },
      });
      return { _id: user._id, email: email };
    } catch {
      throw new BadRequestException('Tài khoản không tồn tại/hợp lệ');
    }
  }
  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { email, password, confirmPassword } = changePasswordDto;
    try {
      if (password !== confirmPassword) {
        throw new BadRequestException('Mật khẩu nhập lại không trùng khớp');
      }
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new BadRequestException('Tài khoản không tồn tại');
      }
      //check code's expired
      const isBeforeCheck = dayjs().isBefore(user.codeExpired);
      if (isBeforeCheck) {
        const newPassword = await hashPassword(user.password);
        await user.updateOne({ password: newPassword });
        return { isBeforeCheck };
      } else {
        throw new BadRequestException({
          message: 'Mã code không hợp lệ hoặc đã hết hạn ',
        });
      }
    } catch {
      throw new BadRequestException('Internal server error');
    }
  }
  async deleteAll() {
    return this.userModel.deleteMany();
  }

  async findByIdWithRolesAndPermissions(id: string) {
    return this.userModel
      .findById(id)
      .populate({
        path: 'roles',
        model: 'Role',
        populate: {
          path: 'permissions',
          model: 'Permission',
        },
      })
      .lean()
      .exec();
  }
}
