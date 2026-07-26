import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { tenantContext } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Access token required');
    }

    // Inject tenant context for Prisma middleware
    const request = context.switchToHttp().getRequest();
    request.tenantId = user.tenantId;
    request.userId = user.userId;

    return user;
  }

  canActivate(context: ExecutionContext) {
    const result = super.canActivate(context);
    return result;
  }
}
