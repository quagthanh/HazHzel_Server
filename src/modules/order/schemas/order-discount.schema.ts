import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type OrderDiscountDocument = HydratedDocument<OrderDiscount>;

@Schema({ _id: false })
export class OrderDiscount {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Discount' })
  discountId: Types.ObjectId;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  priceAtTime: number;
}

export const OrderDiscountSchema = SchemaFactory.createForClass(OrderDiscount);
