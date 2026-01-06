import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class VariantAttribute {
  @Prop({ required: true })
  k: string;

  @Prop({ required: true })
  v: string;
}
