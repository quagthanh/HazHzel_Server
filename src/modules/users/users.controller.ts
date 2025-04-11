import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '@/shared/decorators/customize';
import { LocalAuthGuard } from '@/auth/strategies/local/local-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/shared/decorators/role.decorator';
import { Role } from '@/shared/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('search')
  search() {
    return `search ne`;
  }
  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @UseGuards(RolesGuard)
  @Get()
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.usersService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findByEmail(id);
  }

  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }
  @Delete(':id')
  async remove(@Param('id') _id: string) {
    return this.usersService.remove(_id);
  }
}
