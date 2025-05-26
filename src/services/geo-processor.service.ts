import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, map, firstValueFrom } from 'rxjs';
import {
  GeoProcessorRequestDto,
  GeoProcessorResponseDto,
} from '../dto/geo-processor.dto';

@Injectable()
export class GeoProcessorService {
  private readonly logger = new Logger(GeoProcessorService.name);
  private readonly pythonServiceUrl: string;
  private readonly processPointsEndpoint: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.pythonServiceUrl = this.configService.get<string>(
      'PYTHON_SERVICE_URL',
      'http://localhost:8000',
    );
    this.processPointsEndpoint = this.configService.get<string>(
      'PYTHON_PROCESS_POINTS_ENDPOINT',
      '/geo/process-points',
    );
  }

  async processGeoData(
    request: GeoProcessorRequestDto,
  ): Promise<GeoProcessorResponseDto> {
    try {
      this.logger.log(`Processing ${request.points.length} coordinate points`);

      const response = await firstValueFrom(
        this.httpService
          .post(
            `${this.pythonServiceUrl}${this.processPointsEndpoint}`,
            request,
          )
          .pipe(
            map((response) => response.data as GeoProcessorResponseDto),
            catchError((error: AxiosError) => {
              this.logger.error(
                `Error calling Python service: ${error.message}`,
                error.stack,
              );

              if (error.response?.status === 400) {
                throw new BadRequestException(
                  (error.response.data as string) || 'Invalid request data',
                );
              }

              throw new ServiceUnavailableException(
                'Geo-processing service is unavailable',
              );
            }),
          ),
      );

      this.logger.log('Successfully processed geo data');
      return response;
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Unexpected error: ${errorMessage}`, errorStack);
      throw new ServiceUnavailableException(
        'Geo-processing service encountered an error',
      );
    }
  }
}
