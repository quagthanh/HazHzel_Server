import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VariantDocument = HydratedDocument<Variant>;

@Schema({ timestamps: true })
export class Variant {
  @Prop({ type: Types.ObjectId, required: true })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  priceBeforeDiscount: number;

  @Prop({ type: Number })
  discountPrice: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ type: Number, required: true, min: 0 })
  stock: number;

  @Prop({ type: String })
  sku: string;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
