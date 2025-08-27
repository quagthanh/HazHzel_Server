import { RoleEnum } from '../enums/role.enum';

export const CREATE_MATRIX: Record<RoleEnum, RoleEnum[]> = {
  [RoleEnum.SYSTEM_ADMIN]: [
    RoleEnum.SYSTEM_ADMIN,
    RoleEnum.ADMIN,
    RoleEnum.CUSTOMER,
  ],
  [RoleEnum.ADMIN]: [RoleEnum.CUSTOMER],
  [RoleEnum.CUSTOMER]: [],
};
