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
  async getCart(_id: string) {
    const cart = await this.cartModel
      .findOne({ userId: _id })
      .populate({
        path: 'items',
        model: 'CartItem',
        populate: [
          {
            path: 'productId',
            model: 'Product',
          },
          {
            path: 'variantId',
            model: 'Variant',
          },
        ],
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
        const dbVariantId = dbItem.variantId._id
          ? dbItem.variantId._id.toString()
          : dbItem.variantId.toString();
        return (
          dbProductId === inputItem.productId &&
          dbVariantId === inputItem.variantId
        );
      });
      if (existingItemIndex > -1) {
        const existingItem = cart.items[existingItemIndex] as CartItemDocument;
        await this.cartItemModel.findByIdAndUpdate(existingItem._id, {
          $inc: { quantity: inputItem.quantity },
        });
      } else {
        const newCart = await this.cartItemModel.create({
          productId: inputItem.productId,
          variantId: inputItem.variantId,
          quantity: inputItem.quantity,
        });
        newCartItemIds.push(newCart._id as any);
      }
    }
    if (newCartItemIds.length > 0) {
      cart.items.push(...newCartItemIds);
      await cart.save();
    }

    return this.getCart(userId);
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
    return this.getCart(userId);
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
    return this.getCart(userId);
  }
}
