import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier } from '../supplier/schemas/supplier.schema';
import { Collection } from '../collection/schemas/collection.schema';
import { Category } from '../category/schemas/category.schema';
import { paginationAggregate } from '@/shared/helpers/utils';
import { EntityType } from '@/shared/enums/entity.enum';

@Injectable()
export class TitleAggregationService {
  constructor(
    @InjectModel(Supplier.name) private supplierModel: Model<Supplier>,
    @InjectModel(Collection.name) private collectionModel: Model<Collection>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async getMixedData(query: string, current: number, pageSize: number) {
    const unionPipeline = [
      {
        $project: {
          _id: 1,
          title: '$name',
          slug: 1,
          image: {
            secure_url: { $arrayElemAt: ['$images.secure_url', 0] },
            width: { $ifNull: [{ $arrayElemAt: ['$images.width', 0] }, 500] },
            height: { $ifNull: [{ $arrayElemAt: ['$images.height', 0] }, 500] },
          },
          type: { $literal: EntityType.STORE },
          createdAt: 1,
        },
      },

      {
        $unionWith: {
          coll: 'collections',
          pipeline: [
            { $match: { status: 'ACTIVE' } },
            {
              $project: {
                _id: 1,
                title: '$name',
                slug: 1,
                image: {
                  secure_url: { $arrayElemAt: ['$images.secure_url', 0] },
                  width: {
                    $ifNull: [{ $arrayElemAt: ['$images.width', 0] }, 500],
                  },
                  height: {
                    $ifNull: [{ $arrayElemAt: ['$images.height', 0] }, 500],
                  },
                },
                type: { $literal: EntityType.COLLECTION },
                createdAt: 1,
              },
            },
          ],
        },
      },

      // 3. Gộp CATEGORIES
      {
        $unionWith: {
          coll: 'categories',
          pipeline: [
            {
              $project: {
                _id: 1,
                title: '$name',
                slug: 1,
                image: {
                  secure_url: { $arrayElemAt: ['$images.secure_url', 0] },
                  width: {
                    $ifNull: [{ $arrayElemAt: ['$images.width', 0] }, 500],
                  },
                  height: {
                    $ifNull: [{ $arrayElemAt: ['$images.height', 0] }, 500],
                  },
                },
                type: { $literal: EntityType.CATEGORY },
                createdAt: 1,
              },
            },
          ],
        },
      },
    ];
    return paginationAggregate(
      this.supplierModel,
      query,
      current,
      pageSize,
      unionPipeline,
    );
  }
}
