import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { RoleEnum, RoleOrder } from '../enums/role.enum';
import { CREATE_MATRIX } from '../constants/create_policy';

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
