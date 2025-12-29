import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from '@/modules/address/dto/create-address.dto';
import { statusOrderEnum } from '@/shared/enums/statusOrder.enum';
import { PaymentMethodType } from '@/shared/enums/methodPayment.enum';

export class CreateOrderDto {
  @IsNotEmpty()
  @ValidateNested()
  //   @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsOptional()
  discountCode?: string;

  @IsEnum(statusOrderEnum)
  @IsOptional()
  status?: statusOrderEnum;

  @IsEnum(PaymentMethodType)
  @IsNotEmpty()
  paymentMethod: PaymentMethodType;

  @IsOptional()
  @IsString()
  note?: string;
}
