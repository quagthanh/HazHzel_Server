import { PartialType } from '@nestjs/mapped-types';
import { CreateTitleAggregationDto } from './create-title-aggregation.dto';

export class UpdateTitleAggregationDto extends PartialType(CreateTitleAggregationDto) {}
