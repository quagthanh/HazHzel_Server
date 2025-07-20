import { IsMongoId, IsNotEmpty } from 'class-validator';

export class RemoveImage {
  @IsNotEmpty()
  public_id: string;
}
