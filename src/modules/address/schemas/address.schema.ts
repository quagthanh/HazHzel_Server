import { TypeAddress } from '@/enum/typeAddressUser.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema({ timestamps: true })
export class Address {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true })
  ward: string;

  @Prop({ required: true })
  houseNumber: string;

  @Prop({ type: String, enum: TypeAddress, default: TypeAddress.HOMEADDRESS })
  typeAddress: TypeAddress;

  @Prop({ default: true })
  isDefault: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
