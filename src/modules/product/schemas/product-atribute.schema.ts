import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class ProductAttribute {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], required: true })
  values: string[];
}
