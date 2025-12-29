import { Address } from '@/modules/address/schemas/address.schema';
import { Variant } from '@/modules/variant/schemas/variant.schema';
import { statusSupplier } from '@/shared/enums/statusSupplier.enum';
import { SupplierImage } from '@/shared/interfaces/supplier-image';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SupplierDocument = HydratedDocument<Supplier>;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  contactName: string;

  @Prop({ type: String, unique: true })
  slug: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: [Object], default: [] })
  images: SupplierImage[];

  @Prop({ type: Object })
  address: any;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, enum: statusSupplier, default: statusSupplier.ACTIVE })
  status: string;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
