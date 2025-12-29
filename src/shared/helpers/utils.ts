import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { RoleEnum } from '../enums/role.enum';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { Role } from '@/modules/role/schemas/role.schema';
import { BadRequestException } from '@nestjs/common';

const saltOrRounds = 10;

export const hashPassword = async (plainPassword: string) => {
  try {
    return await bcrypt.hash(plainPassword, saltOrRounds);
  } catch (error) {}
};
export const comparePassword = async (
  plainPassword: string,
  hashPassword: string,
) => {
  try {
    return await bcrypt.compare(plainPassword, hashPassword);
  } catch (error) {}
};

export const isValidId = (id: string): boolean => mongoose.isValidObjectId(id);
export function pickHighestRole(roles: RoleEnum[]): RoleEnum {
  const priority = [RoleEnum.SYSTEM_ADMIN, RoleEnum.ADMIN];

  return priority.find((role) => roles.includes(role));
}
export async function pagination(
  model: Model<any>,
  query: string,
  current: number = 1,
  pageSize: number = 5,
  populate: any[] = [],
  baseProjection?: any,
) {
  const { filter, sort, projection } = aqp(query);
  if (!current) current = 1;
  if (!pageSize) pageSize = 5;

  if (filter.current) delete filter.current;
  if (filter.pageSize) delete filter.pageSize;

  const totalItems = await model.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / pageSize);

  const skip = (current - 1) * pageSize;
  let finalProjection = projection;
  finalProjection = projection
    ? { ...baseProjection, ...projection }
    : baseProjection;
  const result = await model
    .find(filter)
    .skip(skip)
    .limit(pageSize)
    .select(finalProjection)
    .sort(sort as any)
    .populate(populate);
  return {
    meta: {
      current: current,
      pageSize: pageSize,
      pages: totalPages,
      total: totalItems,
    },
    result,
  };
}

export async function paginationAggregate(
  model: Model<any>,
  query: string,
  current = 1,
  pageSize = 10,
  aggregatePipeline: any[] = [],
) {
  const { filter, sort } = aqp(query);

  if (filter.current) delete filter.current;
  if (filter.pageSize) delete filter.pageSize;

  const skip = (current - 1) * pageSize;

  const totalItemsAgg = await model.aggregate([
    { $match: filter },
    ...aggregatePipeline,
    { $count: 'total' },
  ]);

  const totalItems = totalItemsAgg[0]?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const result = await model.aggregate([
    { $match: filter },
    ...aggregatePipeline,
    { $sort: sort || { createdAt: -1 } },
    { $skip: skip },
    { $limit: pageSize },
  ]);

  return {
    meta: {
      current,
      pageSize,
      pages: totalPages,
      total: totalItems,
    },
    result,
  };
}

export async function CheckRole(roleModel: Model<Role>, _id: string) {
  const customerRole = await roleModel.findOne({ _id });
  if (customerRole?.name !== RoleEnum.CUSTOMER) {
    throw new BadRequestException('Must is customer role');
  }
  return !!customerRole;
}
