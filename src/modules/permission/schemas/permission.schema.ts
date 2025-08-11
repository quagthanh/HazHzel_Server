import { Resources } from '@/shared/enums/resources.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class ActionPer {
  @Prop({ type: Boolean, default: false })
  create: boolean;

  @Prop({ type: Boolean, default: false })
  read: boolean;

  @Prop({ type: Boolean, default: false })
  update: boolean;

  @Prop({ type: Boolean, default: false })
  delete: boolean;
}

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true, unique: true, enum: Resources })
  resource: Resources;

  @Prop({ type: ActionPer, default: () => new ActionPer() })
  action: ActionPer;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
