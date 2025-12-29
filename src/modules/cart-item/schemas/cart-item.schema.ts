import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type CartItemDocument = HydratedDocument<CartItem>;

@Schema({ timestamps: true })
export class CartItem {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  })
  productId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
