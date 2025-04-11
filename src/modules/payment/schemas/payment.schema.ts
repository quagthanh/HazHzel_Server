import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['credit_card', 'paypal', 'cash_on_delivery'],
    required: true,
  })
  method: string;

  @Prop({
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String })
  transactionId: string;

  @Prop({ type: Date })
  paidAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
