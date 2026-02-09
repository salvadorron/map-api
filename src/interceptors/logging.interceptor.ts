import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { LogService } from 'src/services/log.service';
import { AlsStore } from 'src/modules/app.module';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logService: LogService;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly als: AsyncLocalStorage<AlsStore>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, params, ip, headers } = request;


    // Excluir el endpoint de logs para evitar registros recursivos
    if (url.startsWith('/logs')) {
      return next.handle();
    }

    // Obtener información del usuario desde AsyncLocalStorage
    const store = this.als.getStore();
    const userId = store?.userId || null;

    // Permitir registrar intentos de login (POST /auth/login) aunque no exista userId aún
    const isAuthLogin = url.startsWith('/auth/login');
    // Solo registrar logs si hay un usuario autenticado, excepto para login
    if (!userId && !isAuthLogin) {
      return next.handle();
    }

    // Determinar el tipo de recurso desde la URL
    const resourceType = this.getResourceTypeFromUrl(url);
    
    // Determinar la acción basada en el método HTTP
    const action = this.getActionFromMethod(method);

    // Omitir logs de operaciones de solo lectura para ahorrar espacio
    // Solo registrar: Creación, Actualización, Eliminación y acciones de auth (p. ej. inicio de sesión)
    if (action === 'view') {
      return next.handle();
    }
    
    // Obtener el ID del recurso si existe
    const resourceId = params?.id || body?.id || null;

    // Obtener IP y User Agent
    const forwardedFor = headers['x-forwarded-for'];
    const realIp = headers['x-real-ip'];
    const ipAddress = this.normalizeIpAddress(ip, forwardedFor, realIp);
    const userAgent = typeof headers['user-agent'] === 'string' ? headers['user-agent'] : null;

    // No almacenamos payloads completos para evitar llenar el storage.
    // Guardamos solo metadatos mínimos en la tabla de logs.

    // Obtener LogService de forma lazy para asegurar que esté inicializado
    if (!this.logService) {
      try {
        this.logService = this.moduleRef.get(LogService, { strict: false });
      } catch (error) {
        // Si no se puede obtener el servicio, no registrar el log
        console.error('No se pudo obtener LogService:', error);
        return next.handle();
      }
    }

    // Ejecutar la operación y registrar el log después
    return next.handle().pipe(
      tap({
        next: async (res) => {
          try {
            if (!this.logService) return;

            let actionResource = action;
            if (action === 'create' && resourceType === 'auth') {
              actionResource = 'login';
            }

            // Si es login, tratar de extraer el user desde la respuesta
            const logUserId = isAuthLogin ? (res?.user?.id || userId) : userId;
            // No guardar `details` para login (confidencial)
            const logDetails = isAuthLogin ? null : body;

            await this.logService.create({
              action: actionResource,
              resource_type: resourceType,
              resource_id: resourceId,
              user_id: logUserId,
              details: logDetails as any,
              ip_address: ipAddress,
              user_agent: userAgent,
            });
          } catch (error) {
            console.error('Error al registrar log:', error);
          }
        },
        error: async (err) => {
          try {
            if (!this.logService) return;
            // No guardar `details` para login errors
            const errorDetails: any = isAuthLogin ? null : { error: err?.message };
            await this.logService.create({
              action: `${action}_ERROR`,
              resource_type: resourceType,
              resource_id: resourceId,
              user_id: userId,
              details: errorDetails,
              ip_address: ipAddress,
              user_agent: userAgent,
            });
          } catch (logError) {
            console.error('Error al registrar log de error:', logError);
          }
        },
      }),
    );
  }

  private getResourceTypeFromUrl(url: string): string {
    // Extraer el tipo de recurso de la URL sin query params
    // Ejemplo: /shapes/123?is_public=true -> shapes, /users -> users
    // Primero remover los query params
    const urlWithoutQuery = url.split('?')[0];
    const segments = urlWithoutQuery.split('/').filter(Boolean);
    return segments[0] || 'unknown';
  }

  private getActionFromMethod(method: string): string {
    const methodMap: Record<string, string> = {
      GET: 'view',
      POST: 'create',
      PATCH: 'update',
      PUT: 'update',
      DELETE: 'delete',
    };
    return methodMap[method.toUpperCase()] || method.toUpperCase();
  }

  private sanitizeBody(body: any): any {
    // Remover campos sensibles como passwords
    const sanitized = { ...body };
    if (sanitized.password) {
      sanitized.password = '[REDACTED]';
    }
    if (sanitized.token) {
      sanitized.token = '[REDACTED]';
    }
    return sanitized;
  }

  private normalizeIpAddress(
    ip: string | undefined,
    forwardedFor: string | string[] | undefined,
    realIp: string | string[] | undefined
  ): string | null {
    // Prioridad: ip directo > x-real-ip > x-forwarded-for
    if (ip) {
      return ip;
    }

    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    if (forwardedFor) {
      // x-forwarded-for puede contener múltiples IPs separadas por coma
      const ipString = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
      return ipString.split(',')[0].trim();
    }

    return null;
  }
}

