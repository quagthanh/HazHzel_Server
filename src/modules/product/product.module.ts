import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SupplierModule } from '../supplier/supplier.module';
import { CategoryModule } from '../category/category.module';
import { CollectionModule } from '../collection/collection.module';
import { VariantModule } from '../variant/variant.module';

@Module({
  imports: [
    forwardRef(() => VariantModule),
    forwardRef(() => SupplierModule),
    forwardRef(() => CollectionModule),
    CategoryModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CloudinaryModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService, MongooseModule],
})
export class ProductModule {}
