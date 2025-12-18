import { ProductImage } from '@/shared/interfaces/product-image';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VariantDocument = HydratedDocument<Variant>;

@Schema({ timestamps: true })
export class Variant {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  originalPrice: number;

  @Prop({ type: Number })
  discountPrice: number;

  @Prop({ type: Number })
  currentPrice: number;

  @Prop({ type: Number })
  promoCodePrice: number;

  @Prop({ type: String })
  color: string;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ type: [Object], default: [] })
  images: ProductImage[];

  @Prop({ type: Number, required: true, min: 0 })
  stock: number;

  @Prop({ type: String })
  sku: string;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
