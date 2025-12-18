import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { VariantService } from './variant.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RemoveImage } from '../product/dto/remove-image.dto';
@Controller('variants')
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @Body() dto: CreateVariantDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.variantService.create(dto, files);
  }

  @Get('/by-product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.variantService.findByProduct(productId);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVariantDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.variantService.update(id, dto, files);
  }

  @Patch(':id/remove-image')
  removeImage(@Param('id') id: string, @Body() removeImage: RemoveImage) {
    return this.variantService.removeImage(id, removeImage);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variantService.remove(id);
  }
}
