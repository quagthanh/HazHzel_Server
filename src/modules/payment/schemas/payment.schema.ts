import { PaymentMethodType } from '@/shared/enums/methodPayment.enum';
import { statusPaymentEnum } from '@/shared/enums/statusPayment.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({
    type: String,
    enum: PaymentMethodType,
    required: true,
  })
  method: PaymentMethodType;

  @Prop({
    type: String,
    enum: statusPaymentEnum,
    default: statusPaymentEnum.PENDING,
  })
  status: statusPaymentEnum;

  @Prop({ type: String })
  transactionId: string;

  @Prop({ type: Date })
  paymentDate: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
