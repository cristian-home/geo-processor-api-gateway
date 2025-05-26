import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeoProcessorController } from '../controllers/geo-processor.controller';
import { GeoProcessorService } from '../services/geo-processor.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000, // 10 seconds timeout
      maxRedirects: 5,
    }),
  ],
  controllers: [GeoProcessorController],
  providers: [GeoProcessorService],
})
export class GeoProcessorModule {}
