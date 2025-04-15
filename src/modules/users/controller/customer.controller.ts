import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '@/shared/decorators/customize';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../users.service';

@Controller('customer/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
