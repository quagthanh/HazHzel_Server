import { Variant } from '@/modules/variant/schemas/variant.schema';
import { statusProduct } from '@/shared/enums/statusProduct.enum';
import { ProductImage } from '@/shared/interfaces/product-image';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, unique: true })
  slug: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' })
  supplierId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: [Object], default: [] })
  images: ProductImage[];

  @Prop({
    type: String,
    enum: statusProduct,
    default: statusProduct.ACTIVE,
  })
  status: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isSale: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isHot: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
