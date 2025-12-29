import { PartialType } from '@nestjs/mapped-types';
import { AddressDto } from './create-address.dto';

export class UpdateAddressDto extends PartialType(AddressDto) {}
