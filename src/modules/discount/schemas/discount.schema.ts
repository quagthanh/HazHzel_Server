import { statusDiscount } from '@/shared/enums/statusDiscount.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DiscountDocument = HydratedDocument<Discount>;

@Schema({ timestamps: true })
export class Discount {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, enum: ['percentage', 'fixed'], required: true })
  discountType: string;

  @Prop({ type: Number, required: true })
  discountValue: number;

  @Prop({ type: Number, default: 0 })
  minOrderValue: number;

  @Prop({ type: Number, default: 0 })
  maxUses: number;

  @Prop({ type: Number, default: 0 })
  usedCount: number;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({
    type: String,
    enum: statusDiscount,
    default: statusDiscount.ACTIVE,
  })
  status: string;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);
