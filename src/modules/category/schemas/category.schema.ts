import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  slug: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
