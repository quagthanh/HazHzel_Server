import { Controller, Get, Query } from '@nestjs/common';
import { TitleAggregationService } from './title-aggregation.service';
import { Public, ResponseMessage } from '@/shared/decorators/customize';

@Controller('title-aggregation')
export class TitleAggregationController {
  constructor(
    private readonly titleAggregationService: TitleAggregationService,
  ) {}

  @Public()
  @Get()
  @ResponseMessage('Get aggregated masonry data successful')
  async getAggregatedData(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.titleAggregationService.getMixedData(
      query,
      Number(current) || 1,
      Number(pageSize) || 20,
    );
  }
}
