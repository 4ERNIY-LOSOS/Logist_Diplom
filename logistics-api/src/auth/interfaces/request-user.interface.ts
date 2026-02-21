import { RoleName } from '../enums/role-name.enum';

export interface RequestUser {
  userId: string;
  username: string;
  role: RoleName;
  companyId?: string;
}
