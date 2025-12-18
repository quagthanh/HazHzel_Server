import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { Public } from '@/shared/decorators/customize';
import { Permission } from '@/shared/decorators/permissions.decorator';
import { Resources } from '@/shared/enums/resources.enum';
import { PermissionGuard } from '@/auth/guards/permission.guard';
import { JwtAuthGuard } from '@/auth/strategies/jwt/jwt-auth.guard';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  @UseGuards(PermissionGuard)
  @Permission(Resources.PERMISSION, 'read')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadFile(file);
  }
  @UseGuards(JwtAuthGuard)
  @Public()
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.cloudinaryService.uploadMultiFiles(files);
  }
}
