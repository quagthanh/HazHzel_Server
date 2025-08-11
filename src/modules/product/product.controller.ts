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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RemoveImage } from './dto/remove-image.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.create(createProductDto, files);
  }

  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.productService.findAll(query, +current, +pageSize);
  }

  @Get('/shop/:id')
  findByShopId(@Param('id') _id: string) {
    return this.productService.findByShopId(_id);
  }

  @Get(':slug')
  findByProductSlug(@Param('slug') slug: string) {
    return this.productService.findByProductSlug(slug);
  }
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  update(
    @Param('id') _id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.update(_id, updateProductDto, files);
  }
  @Patch('/view/:slug')
  async increaseProductView(@Param('slug') slug: string) {
    return this.productService.increaseProductView(slug);
  }

  @Patch(':id/remove-image')
  async removeImage(
    @Param('id') _id: string,
    @Body() removeImage: RemoveImage,
  ) {
    return this.productService.removeImage(_id, removeImage);
  }

  @Delete(':id')
  remove(@Param('id') _id: string) {
    return this.productService.remove(_id);
  }
}
