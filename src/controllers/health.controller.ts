import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, map, firstValueFrom, timeout, throwError } from 'rxjs';

@Controller('health')
export class HealthController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async checkHealth() {
    const pythonServiceUrl = this.configService.get<string>(
      'PYTHON_SERVICE_URL',
      'http://localhost:8000',
    );

    try {
      // Check if Python service is available
      const pythonHealthCheck = await firstValueFrom(
        this.httpService.get(`${pythonServiceUrl}/health`).pipe(
          timeout(5000), // 5 second timeout
          map(() => ({
            status: 'healthy',
            service: 'python-fastapi',
            timestamp: new Date().toISOString(),
          })),
          catchError(() => {
            return throwError(() => new Error('Python service unavailable'));
          }),
        ),
      );

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          'api-gateway': {
            status: 'healthy',
            version: process.env.npm_package_version || '0.0.1',
          },
          'python-service': pythonHealthCheck,
        },
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'One or more services are unavailable',
        services: {
          'api-gateway': {
            status: 'healthy',
            version: process.env.npm_package_version || '0.0.1',
          },
          'python-service': {
            status: 'unhealthy',
            error: 'Service unavailable',
          },
        },
      });
    }
  }

  @Get('ready')
  checkReadiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }
}
