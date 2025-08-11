import { SetMetadata } from '@nestjs/common';
import { Resources } from '../enums/resources.enum';
import { ActionPer } from '@/modules/permission/schemas/permission.schema';

export const PERMISSION_KEY = 'permissions';
export const Permission = (resource: Resources, action: keyof ActionPer) =>
  SetMetadata(PERMISSION_KEY, { resource, action });
