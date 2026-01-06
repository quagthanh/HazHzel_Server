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
import { CartService } from './cart.service';
import { AddToCartDto } from '../cart-item/dto/add-cart-item.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from '../cart-item/dto/update-cart-item.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { DeleteCartItemDto } from './dto/delete-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req) {
    const { user: _id } = req;
    return this.cartService.getCart(_id);
  }

  @Post(':userId')
  addToCart(@Body() addCart: CreateCartDto, @Param('userId') userId: string) {
    return this.cartService.addToCart(userId, addCart);
  }
  @Delete(':userId')
  removeCartItem(
    @Param('userId') userId: string,
    @Body() deleteCartItemDto: DeleteCartItemDto,
  ) {
    return this.cartService.removeCartItem(userId, deleteCartItemDto);
  }
  @Delete('/clear/:userId')
  removeCart(@Param('userId') userId: string) {
    return this.cartService.removeCart(userId);
  }
}
