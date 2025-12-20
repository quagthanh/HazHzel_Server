import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { features } from 'process';
import mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    ProductModule,
    CloudinaryModule,
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}
