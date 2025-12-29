import { TypeAddress } from '@/shared/enums/typeAddressUser.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema({ timestamps: true })
export class Address {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: false })
  ward: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: String, enum: TypeAddress, default: TypeAddress.HOMEADDRESS })
  typeAddress: TypeAddress;

  @Prop({ default: true })
  isDefault: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
