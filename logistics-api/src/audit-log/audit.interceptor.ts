import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, body } = request;

    if (!user) return next.handle();

    return next.handle().pipe(
      tap(async (data) => {
        try {
          if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
            const entityName = this._getEntityName(url);
            if (!entityName) return;

            const entityId = data?.id || request.params?.id || 'N/A';
            const actionType = `${method}_${entityName.toUpperCase()}`;

            await this.auditLogService.create({
              userId: user.userId,
              actionType,
              entityName,
              entityId,
              details: {
                url,
                body: method !== 'DELETE' ? body : undefined,
                response: data,
              },
            });
          }
        } catch (error) {
          this.logger.error('Failed to create audit log', error.stack);
        }
      }),
    );
  }

  private _getEntityName(url: string): string | null {
    if (url.includes('/request')) return 'Request';
    if (url.includes('/shipment')) return 'Shipment';
    if (url.includes('/user')) return 'User';
    if (url.includes('/company')) return 'Company';
    if (url.includes('/driver')) return 'Driver';
    if (url.includes('/vehicle')) return 'Vehicle';
    return null;
  }
}
