import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { statusPaymentEnum } from '@/shared/enums/statusPayment.enum';
import { PaymentMethodType } from '@/shared/enums/methodPayment.enum';

export class PaymentDto {
  @IsEnum(PaymentMethodType)
  method: PaymentMethodType;

  @IsOptional()
  @IsEnum(statusPaymentEnum)
  status?: statusPaymentEnum;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: Date;
}
