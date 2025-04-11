import { Address } from '@/modules/address/schemas/address.schema';
import { Discount } from '@/modules/discount/schemas/discount.schema';
import { OrderItem } from '@/modules/order-item/schemas/order-item.schema';
import { Payment } from '@/modules/payment/schemas/payment.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  items: OrderItem[];

  @Prop({ type: Number, required: true })
  totalAmount: number;

  @Prop({ type: Object })
  shippingAddress: Address;

  @Prop({ type: Number, default: 0 })
  shippingCost: number;

  @Prop({ type: Object })
  discount: Discount;

  @Prop({
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Object })
  payment: Payment;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deliveredAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
