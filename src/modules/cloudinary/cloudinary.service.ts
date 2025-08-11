import { HttpException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CloudinaryResponse } from '@/shared/interfaces/cloudinary-response';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'mono-store',
          // responsive_breakpoints: [
          //   {
          //     create_derived: true,
          //     bytes_step: 50000,
          //     min_width: 320,
          //     max_width: 1280,
          //     max_images: 4,
          //   },
          // ],
          // format: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new HttpException(
                {
                  statusCode: error?.http_code || 500,
                  message: error?.message || 'Tải ảnh thất bại',
                  error: error?.name,
                },
                error?.http_code || 500,
              ),
            );
          }
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
  uploadMultiFiles(
    files: Express.Multer.File[],
  ): Promise<CloudinaryResponse[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }
  async deleteFile(_id: string) {
    return await cloudinary.uploader.destroy(_id);
  }
  async deleteFiles(_ids: string[]): Promise<any> {
    const deleteFiles = _ids.map((id) => this.deleteFile(id));
    return Promise.all(deleteFiles);
  }
}
