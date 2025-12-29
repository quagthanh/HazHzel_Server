import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCollectionDto {
  @IsNotEmpty({ message: 'Collection name is required' })
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  status: string;
}
