import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CartItem } from './schemas/cart-item.schema';
import { Model, Types } from 'mongoose';
import { AddToCartDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
@Injectable()
export class CartItemService {
  constructor(
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItem>,
  ) {}
  async create(createDto: AddToCartDto) {
    return this.cartItemModel.create({
      productId: new Types.ObjectId(createDto.productId),
      quantity: createDto.quantity,
    });
  }

  async findAll() {
    return this.cartItemModel.find().populate('productId');
  }

  async findOne(id: string) {
    const item = await this.cartItemModel.findById(id).populate('productId');
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async update(id: string, updateDto: UpdateCartItemDto) {
    const updatedItem = await this.cartItemModel.findByIdAndUpdate(
      id,
      { quantity: updateDto.quantity },
      { new: true },
    );
    if (!updatedItem) throw new NotFoundException('Cart Item not found');
    return updatedItem;
  }
}
