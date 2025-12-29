import { BadRequestException, Injectable } from '@nestjs/common';
import { Cart, CartDocument } from './schemas/cart.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CartItem,
  CartItemDocument,
} from '../cart-item/schemas/cart-item.schema';
import { CreateCartDto } from './dto/create-cart.dto';
import { DeleteCartItemDto } from './dto/delete-cart.dto';
@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItem>,
  ) {}
  async getCart(user: any) {
    const { _id } = user;
    const cart = await this.cartModel
      .findOne({ userId: _id })
      .populate({
        path: 'items',
        model: 'CartItem',
        populate: {
          path: 'productId',
          model: 'Product',
        },
      })
      .exec();
    if (!cart) {
      throw new BadRequestException('Cart is not exist or empty');
    }
    return cart;
  }
  async addToCart(userId: string, addCart: CreateCartDto) {
    const { items } = addCart;
    let cart = await this.cartModel.findOne({ userId }).populate('items');
    if (!cart) {
      cart = await this.cartModel.create({ userId: userId, items: [] });
    }
    const newCartItemIds = [];
    for (const inputItem of items) {
      const existingItemIndex = cart.items.findIndex((dbItem: any) => {
        const dbProductId = dbItem.productId._id
          ? dbItem.productId._id.toString()
          : dbItem.productId.toString();
        return dbProductId === inputItem.productId;
      });
      if (existingItemIndex > -1) {
        const existingItem = cart.items[existingItemIndex] as CartItemDocument;
        await this.cartItemModel.findByIdAndUpdate(existingItem._id, {
          $inc: { quantity: inputItem.quantity },
        });
      } else {
        const newCart = await this.cartItemModel.create({
          productId: inputItem.productId,
          quantity: inputItem.quantity,
        });
        newCartItemIds.push(newCart._id as any);
      }
    }
    if (newCartItemIds.length > 0) {
      cart.items.push(...newCartItemIds);
      await cart.save();
    }

    const user = { _id: userId };
    return this.getCart(user);
  }
  async removeCartItem(userId: string, deleteCartItemDto: DeleteCartItemDto) {
    const { cartItemId } = deleteCartItemDto;
    const deletedItem = await this.cartItemModel.findByIdAndDelete(cartItemId);
    if (!deletedItem) {
      throw new BadRequestException('Cart Item not found');
    }
    const deleteCart = await this.cartModel.findOneAndUpdate(
      { userId: userId },
      { $pull: { items: cartItemId } },
      { new: true },
    );
    if (!deleteCart) {
      throw new BadRequestException(
        'Cart not found for user(cart item is deleted)',
      );
    }
    const user = { _id: userId };
    return this.getCart(user);
  }
  async removeCart(userId: string) {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new BadRequestException('Cart not found');
    }
    if (cart.items.length === 0) {
      return cart;
    }
    const listCartItemIds = cart.items.map(
      (item: CartItemDocument) => item._id,
    );
    const result = await this.cartItemModel.deleteMany({
      _id: { $in: [...listCartItemIds] },
    });
    if (!result) {
      throw new BadRequestException(
        'Can not delete cart item in clear process ',
      );
    }
    await this.cartModel.findOneAndUpdate({ userId }, { items: [] });
    const user = { _id: userId };
    return this.getCart(user);
  }
}
