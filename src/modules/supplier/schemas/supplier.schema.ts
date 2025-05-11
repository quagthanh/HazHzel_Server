import { Address } from '@/modules/address/schemas/address.schema';
import { Variant } from '@/modules/variant/schemas/variant.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SupplierDocument = HydratedDocument<Supplier>;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  contactName: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: Object })
  address: Address;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
