import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantContext } from '../../prisma/prisma.service';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (user?.tenantId) {
      // Run the handler within the tenant context (AsyncLocalStorage)
      return new Observable(observer => {
        tenantContext.run({ tenantId: user.tenantId, userId: user.userId }, () => {
          next.handle().subscribe({
            next: val => observer.next(val),
            error: err => observer.error(err),
            complete: () => observer.complete(),
          });
        });
      });
    }

    return next.handle();
  }
}
