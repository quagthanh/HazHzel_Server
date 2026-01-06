import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Model } from 'mongoose';
import { CartService } from '../cart/cart.service';
import { statusOrderEnum } from '@/shared/enums/statusOrder.enum';
import { statusPaymentEnum } from '@/shared/enums/statusPayment.enum';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private cartService: CartService,
    private inventoryService: InventoryService,
  ) {}
  async checkout(userId: string, createOrderDto: CreateOrderDto) {
    const { shippingAddress, paymentMethod, discountCode } = createOrderDto;

    const cart = await this.cartService.getCart(userId);
    console.log('Cart', cart);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const orderItems = [];
    let subTotal = 0;
    const itemsToReduce = [];
    for (const item of cart.items) {
      const product = item.productId as any;
      const variant = item.variantId as any;
      if (!product || !variant) {
        throw new BadRequestException('Sản phẩm hoặc biến thể không tồn tại');
      }
      itemsToReduce.push({
        variantId: variant._id.toString(),
        quantity: item.quantity,
      });
      console.log('Product in Order Service:', product);
      console.log('Variant in Order Service:', variant);
      orderItems.push({
        productId: product._id,
        variantId: variant._id,
        name: variant.name,
        price: variant.currentPrice,
        quantity: item.quantity,
        image: variant.image,
      });

      subTotal += variant.currentPrice * item.quantity;
    }
    await this.inventoryService.reduceStock(itemsToReduce);
    const shippingCost = 30000;

    let discountObj = null;
    let discountAmount = 0;

    const totalPrice = subTotal + shippingCost - discountAmount;

    const newOrder = await this.orderModel.create({
      userId,
      items: orderItems,
      subTotal,
      shippingCost,
      totalPrice,
      shippingAddress,
      status: statusOrderEnum.PENDING,
      payment: {
        method: paymentMethod,
        status: statusPaymentEnum.PENDING,
        paymentDate: new Date(),
      },
      discount: discountObj,
    });

    await this.cartService.removeCart(userId);

    return newOrder;
  }
}
