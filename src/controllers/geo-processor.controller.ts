import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseInterceptors,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { GeoProcessorService } from '../services/geo-processor.service';
import {
  GeoProcessorRequestDto,
  GeoProcessorResponseDto,
} from '../dto/geo-processor.dto';

@Controller('geo')
@UseInterceptors(CacheInterceptor)
export class GeoProcessorController {
  private readonly logger = new Logger(GeoProcessorController.name);

  constructor(private readonly geoProcessorService: GeoProcessorService) {}

  @Post('process-points')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(300) // Cache for 5 minutes
  async processCoordinates(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    request: GeoProcessorRequestDto,
  ): Promise<GeoProcessorResponseDto> {
    this.logger.log(
      `Received request to process ${request.points.length} coordinates`,
    );

    const result = await this.geoProcessorService.processGeoData(request);

    this.logger.log('Successfully processed coordinates');
    return result;
  }
}
