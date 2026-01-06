import { forwardRef, Module } from '@nestjs/common';
import { VariantService } from './variant.service';
import { VariantController } from './variant.controller';
import { ProductModule } from '../product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Variant, VariantSchema } from './schemas/variant.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    forwardRef(() => ProductModule),
    CloudinaryModule,
    MongooseModule.forFeature([{ name: Variant.name, schema: VariantSchema }]),
  ],
  controllers: [VariantController],
  providers: [VariantService],
  exports: [MongooseModule, VariantService],
})
export class VariantModule {}
