import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true })
  resource: string;

  @Prop({ type: String })
  action: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
