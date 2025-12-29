import { DiscountType } from '@/shared/enums/typeDiscount.enum';
import { statusDiscount } from '@/shared/enums/statusDiscount.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DiscountDocument = HydratedDocument<Discount>;

@Schema({ timestamps: true })
export class Discount {
  @Prop({ type: String, required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, enum: DiscountType, default: DiscountType.FIXED })
  type: DiscountType;

  @Prop({ type: Number, required: true })
  value: number;

  @Prop({ type: Number, default: 10 })
  maxUses: number;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({
    type: String,
    enum: statusDiscount,
    default: statusDiscount.ACTIVE,
  })
  status: statusDiscount;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);
