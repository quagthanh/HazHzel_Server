import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RestockDto } from './dto/restock.dto';
import { Variant } from '../variant/schemas/variant.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
  ) {}

  // 1. Check Stock (Chỉ kiểm tra, không trừ)
  async checkStock(variantId: string, quantity: number): Promise<boolean> {
    const variant = await this.variantModel.findById(variantId);
    if (!variant) throw new BadRequestException('Variant not found');
    return variant.stock >= quantity;
  }

  // 2. Reduce Stock (Trừ kho khi có đơn hàng) - Dùng cho Module Order gọi
  async reduceStock(items: { variantId: string; quantity: number }[]) {
    // Vì MongoDB transaction cần setup Replica Set (hơi phức tạp với local dev),
    // nên ở level này ta dùng Promise.all để chạy song song cho đơn giản.

    const errors = [];

    for (const item of items) {
      // Tìm và update nguyên tử (Atomic)
      const result = await this.variantModel.findOneAndUpdate(
        {
          _id: item.variantId,
          stock: { $gte: item.quantity }, // Điều kiện: Stock phải >= số lượng mua
        },
        {
          $inc: { stock: -item.quantity, sold: +item.quantity }, // Trừ stock, tăng sold
        },
        { new: true },
      );

      if (!result) {
        // Nếu không update được (do không tìm thấy hoặc hết hàng)
        errors.push(item.variantId);
      }
    }

    // Nếu có sản phẩm lỗi, báo về cho Order biết
    if (errors.length > 0) {
      // Thực tế: Cần logic Rollback (trả lại kho những cái đã trừ thành công).
      // Nhưng ở mức cơ bản, ta throw error để Order biết.
      throw new BadRequestException(
        `Sản phẩm ${errors.join(', ')} không đủ tồn kho`,
      );
    }

    return true;
  }

  // 3. Restock (Nhập kho - Dành cho Admin)
  async restock(restockDto: RestockDto) {
    const { variantId, quantity } = restockDto;

    return this.variantModel.findByIdAndUpdate(
      variantId,
      { $inc: { stock: quantity } }, // Cộng dồn số lượng
      { new: true },
    );
  }
}
