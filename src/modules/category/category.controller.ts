import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ResponseMessage } from '@/shared/decorators/customize';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ResponseMessage('Category created successfully')
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.categoryService.create(createCategoryDto, files);
  }

  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.categoryService.findAll(query, +current, +pageSize);
  }
  @Get('by-name/:name')
  findByName(@Param('name') name: string) {
    return this.categoryService.findByName(name);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
