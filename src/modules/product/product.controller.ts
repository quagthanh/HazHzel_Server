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
import { Public, ResponseMessage } from '@/shared/decorators/customize';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ResponseMessage('Create product successful')
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.create(createProductDto, files);
  }
  @Get('/admin')
  @ResponseMessage('Fetched all products successfull')
  findAllForAdmin(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.productService.findAllForAdmin(
      query,
      Number(current) || 1,
      Number(pageSize) || 10,
    );
  }
  @Public()
  @Get()
  @ResponseMessage('Fetched all products successfull')
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.productService.findAll(
      query,
      Number(current) || 1,
      Number(pageSize) || 10,
    );
  }
  @Public()
  @Get('/by-supplier/:supplierSlug')
  @ResponseMessage('Fetched products by supplier successful')
  findBySupplier(
    @Param('supplierSlug') supplierSlug: string,
    @Query() query: string,
    @Query('current') current?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.productService.findBySupplier(
      supplierSlug,
      query,
      Number(current) || 1,
      Number(pageSize) || 10,
    );
  }
  @Public()
  @Get('/home-new-brand/:supplierSlug')
  @ResponseMessage('Fetched products by supplier successful')
  findHomeNewBrand(
    @Param('supplierSlug') supplierSlug: string,
    @Query() query: string,
    @Query('current') current?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.productService.findHomeNewBrand(
      supplierSlug,
      query,
      Number(current) || 1,
      Number(pageSize) || 10,
    );
  }
  @Public()
  @Get('/actions/search')
  @ResponseMessage('Search products success')
  searchProducts(@Query('keyword') keyword: string) {
    console.log('Check query:', keyword);
    if (!keyword) return [];
    return this.productService.searchByKeyword(keyword);
  }
  @Public()
  @Get('/actions/top-viewed')
  @ResponseMessage('Get top viewed products success')
  getTopViewed() {
    return this.productService.findTopViewed(10);
  }
  @Public()
  @Get(':slug')
  findByProductSlug(@Param('slug') slug: string) {
    return this.productService.findByProductSlug(slug);
  }
  @Public()
  @Get('/by-category/:categorySlug')
  @ResponseMessage('Fetched products by category successful')
  findByCategory(
    @Param('categorySlug') categorySlug: string,
    @Query() query: string,
    @Query('current') current?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    console.log('Fetch products by category with params:', {
      categorySlug,
      query,
    });
    return this.productService.findByCategory(
      categorySlug,
      query,
      Number(current) || 1,
      Number(pageSize) || 10,
    );
  }

  @Public()
  @Get('/by-collection/:collectionSlug')
  @ResponseMessage('Fetched products by collection successful')
  findByCollection(
    @Param('collectionSlug') collectionSlug: string,
    @Query() query: string,
    @Query('current') current?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.productService.findByCollection(
      collectionSlug,
      query,
      Number(current) || 1,
      Number(pageSize) || 10,
    );
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
