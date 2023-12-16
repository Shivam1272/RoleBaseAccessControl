// admin.guard.ts
import { Injectable } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

@Injectable()
export class AdminGuard extends RolesGuard {
  constructor() {
    super('ADMIN');
  }
}
