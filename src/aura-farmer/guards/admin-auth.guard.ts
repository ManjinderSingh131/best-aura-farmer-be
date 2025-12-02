import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const adminSecret = request.headers['x-admin-secret'];
    
    const expectedSecret = process.env.ADMIN_SECRET_KEY;
    console.log(expectedSecret, 'expected secret>>>>>')
    if (!expectedSecret) {
      throw new UnauthorizedException('Admin secret key not configured');
    }
    
    if (!adminSecret) {
      throw new UnauthorizedException('Admin secret key required');
    }
    
    if (adminSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid admin secret key');
    }
    
    return true;
  }
}
