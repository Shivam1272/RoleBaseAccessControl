// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowedRole: string) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | false {
    const request = context.switchToHttp().getRequest();
    console.log(request.user.role);
    
    return request.user && request.user.role === this.allowedRole;
  }
}
