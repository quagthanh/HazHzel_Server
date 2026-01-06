import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { RestockDto } from './dto/restock.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('restock')
  restock(@Body() dto: RestockDto) {
    return this.inventoryService.restock(dto);
  }
}
