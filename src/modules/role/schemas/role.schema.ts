import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
  @Prop({ type: String })
  roleName: string;

  @Prop({ type: Types.ObjectId, ref: 'Permission' })
  permissionsId: Types.ObjectId;
}
export const RoleSchema = SchemaFactory.createForClass(Role);
