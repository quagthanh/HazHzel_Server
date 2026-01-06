import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Public, ResponseMessage } from '@/shared/decorators/customize';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ResponseMessage('Create collection successful')
  create(
    @Body() createCollectionDto: CreateCollectionDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.collectionService.create(createCollectionDto, files);
  }

  @Public()
  @Get('/admin')
  @ResponseMessage('Fetched all collections successful')
  findAllForAdmin(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.collectionService.findAllForAdmin(
      query,
      Number(current) || 1,
      Number(pageSize) || 10,
    );
  }
  @Public()
  @Get('/actions/search')
  @ResponseMessage('Search collections success')
  searchCollections(@Query('keyword') keyword: string) {
    if (!keyword) return [];
    return this.collectionService.searchByKeyword(keyword);
  }
  @Public()
  @Get()
  @ResponseMessage('Fetched all collections successful')
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.collectionService.findAll(
      query,
      Number(current) || 1,
      Number(pageSize) || 10,
    );
  }

  @Get(':id')
  @ResponseMessage('Fetched collection successful')
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(id);
  }

  @Get('/top/3')
  @Public()
  @ResponseMessage('Fetched top 3 collections successfully')
  getTopCollections() {
    return this.collectionService.getTop3CollectionsByProductViews();
  }

  @Get('/by-detail/:slug')
  @Public()
  @ResponseMessage('Get collection detail by slug')
  async getCollectionBySlug(@Param('slug') slug: string) {
    return this.collectionService.findIdBySlug(slug);
  }

  @Patch(':id')
  @ResponseMessage('Update collection successful')
  @UseInterceptors(FilesInterceptor('files'))
  update(
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.collectionService.update(id, updateCollectionDto, files);
  }

  @Delete(':id')
  @ResponseMessage('Delete collection successful')
  remove(@Param('id') id: string) {
    return this.collectionService.remove(id);
  }
}
