import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Request,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { InternalCreateUser } from './dto/internal-create-user.dto';
import { Roles } from '@/shared/decorators/role.decorator';
import { RoleEnum } from '@/shared/enums/role.enum';
import { ResponseMessage } from '@/shared/decorators/customize';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Roles(RoleEnum.ADMIN, RoleEnum.SYSTEM_ADMIN)
  @ResponseMessage('Successful create')
  @Post('/create-users')
  handleRegister(
    @Body() internalRegisterDto: InternalCreateUser,
    @Request() req,
  ) {
    const callerRoles = req?.user?.roles;
    return this.adminService.handleRegister(internalRegisterDto, callerRoles);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SYSTEM_ADMIN)
  @ResponseMessage('Successful fetch')
  @Get('users')
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Req() req,
  ) {
    const callerRoles = (req.user?.roles || []) as RoleEnum[];
    return this.adminService.findAll(query, +current, +pageSize, callerRoles);
  }
}
