import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { Public } from '@/decorator/customize';
import { query } from 'express';
import { RolesGuard } from '@/auth/passport/roles.guard';
import { Role } from '@/enum/role.enum';
import { Roles } from '@/decorator/role.decorator';
import { LocalAuthGuard } from '@/auth/passport/local-auth.guard';
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}
@UseGuards(LocalAuthGuard,RolesGuard)
@Roles(Role.ADMIN)
@Get('docs')
test(){ 
  return  "this"
}
}
