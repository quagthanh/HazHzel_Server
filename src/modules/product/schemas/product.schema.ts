import { Variant } from '@/modules/variant/schemas/variant.schema';
import { statusProduct } from '@/shared/enums/statusProduct.enum';
import { ProductImage } from '@/shared/interfaces/product-image';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true, min: 0 })
  stock: number;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, unique: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Supplier' })
  supplierId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  views: Number;

  @Prop({ type: [Object], default: [] })
  variants: Variant[];

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
  })
  is_sale: boolean;

  @Prop({
    type: Boolean,
  })
  is_hot: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
