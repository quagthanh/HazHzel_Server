import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    const cloudName = configService.get<string>('CLOUDINARY_NAME');
    const apiKey = configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = configService.get<string>('CLOUDINARY_API_SECRET');

    console.log('CLOUDINARY_NAME:', cloudName);
    console.log('CLOUDINARY_API_KEY:', apiKey);
    console.log('CLOUDINARY_API_SECRET:', apiSecret);

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    return cloudinary;
  },
  inject: [ConfigService],
};
