import { forwardRef, Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    forwardRef(() => ProductModule),
    CloudinaryModule,
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService, MongooseModule],
})
export class SupplierModule {}
