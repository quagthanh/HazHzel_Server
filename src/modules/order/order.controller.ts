import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/checkout')
  create(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    const { user: userId } = req;
    return this.orderService.checkout(userId, createOrderDto);
  }
}
