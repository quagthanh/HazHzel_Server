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
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Public, ResponseMessage } from '@/shared/decorators/customize';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ResponseMessage('Create supplier successful')
  create(
    @Body() createSupplierDto: CreateSupplierDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.supplierService.create(createSupplierDto, files);
  }

  @Public()
  @Get('/admin')
  @ResponseMessage('Fetched all suppliers successful')
  findAllForAdmin(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.supplierService.findAllForAdmin(
      query,
      Number(current) || 1,
      Number(pageSize) || 10,
    );
  }

  @Public()
  @Get()
  @ResponseMessage('Fetched all suppliers successful')
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.supplierService.findAll(
      query,
      Number(current) || 1,
      Number(pageSize) || 10,
    );
  }

  @Get(':id')
  @ResponseMessage('Fetched supplier successful')
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @Get('/detail/top')
  @Public()
  @ResponseMessage('Fetched top 3 suppliers successfully')
  getTopSuppliers() {
    return this.supplierService.getTop3SuppliersByProductViews();
  }

  @Patch(':id')
  @ResponseMessage('Update supplier successful')
  @UseInterceptors(FilesInterceptor('files'))
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.supplierService.update(id, updateSupplierDto, files);
  }

  @Delete(':id')
  @ResponseMessage('Delete supplier successful')
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }
}
