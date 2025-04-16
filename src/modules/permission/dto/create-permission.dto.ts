import { IsNotEmpty } from 'class-validator';
import { ActionPer } from '../schemas/permission.schema';

export class CreatePermissionDto {
  @IsNotEmpty()
  resource: string;

  action: ActionPer;
}
