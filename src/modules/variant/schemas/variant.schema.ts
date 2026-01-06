import { ProductImage } from '@/shared/interfaces/product-image';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { VariantAttribute } from './variant-atribute.schema';

export type VariantDocument = HydratedDocument<Variant>;

@Schema({ timestamps: true })
export class Variant {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  })
  productId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  originalPrice: number;

  @Prop({ type: Number })
  discountPrice: number;

  @Prop({ type: Number })
  currentPrice: number;

  @Prop({ type: Number })
  promoCodePrice: number;

  @Prop({ type: [VariantAttribute], required: true })
  attributes: VariantAttribute[];

  @Prop({ type: [Object], default: [] })
  images: ProductImage[];

  @Prop({ type: Number, required: true, min: 0 })
  stock: number;

  @Prop({ type: String, unique: true })
  sku: string;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
