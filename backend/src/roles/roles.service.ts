import { Injectable } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class RolesService {
  private readonly roles = [
    { name: UserRole.OWNER, description: 'Full system access' },
    { name: UserRole.MANAGER, description: 'Daily operations and reports' },
    { name: UserRole.CASHIER, description: 'POS operations only' },
    { name: UserRole.KITCHEN, description: 'Kitchen display only' },
    { name: UserRole.ADMIN, description: 'System configuration' },
  ];

  getAllRoles() {
    return this.roles;
  }

  getRoleByName(name: UserRole) {
    return this.roles.find((role) => role.name === name);
  }
}
