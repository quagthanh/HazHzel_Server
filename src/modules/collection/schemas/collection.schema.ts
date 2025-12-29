import { statusCollection } from '@/shared/enums/statusCollection.enum';
import { statusSupplier } from '@/shared/enums/statusSupplier.enum';
import { CollectionImage } from '@/shared/interfaces/collection-image';
import { SupplierImage } from '@/shared/interfaces/supplier-image';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CollectionDocument = HydratedDocument<Collection>;

@Schema({ timestamps: true })
export class Collection {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: [Object], default: [] })
  images: CollectionImage[];

  @Prop({
    type: String,
    enum: statusCollection,
    default: statusCollection.ACTIVE,
  })
  status: string;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
