import { Module } from '@nestjs/common';
import { TitleAggregationService } from './title-aggregation.service';
import { TitleAggregationController } from './title-aggregation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Supplier, SupplierSchema } from '../supplier/schemas/supplier.schema';
import {
  Collection,
  CollectionSchema,
} from '../collection/schemas/collection.schema';
import { Category, CategorySchema } from '../category/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: Collection.name, schema: CollectionSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [TitleAggregationController],
  providers: [TitleAggregationService],
})
export class TitleAggregationModule {}
