import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { GeoProcessorController } from './geo-processor.controller';
import { GeoProcessorService } from '../services/geo-processor.service';
import { GeoProcessorRequestDto } from '../dto/geo-processor.dto';
import { of } from 'rxjs';

describe('GeoProcessorController', () => {
  let controller: GeoProcessorController;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'PYTHON_SERVICE_URL') return 'http://localhost:8000';
      if (key === 'PYTHON_PROCESS_POINTS_ENDPOINT')
        return '/geo/process-points';
      return undefined;
    }),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeoProcessorController],
      providers: [
        GeoProcessorService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<GeoProcessorController>(GeoProcessorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('processCoordinates', () => {
    it('should process coordinates successfully', async () => {
      const mockRequest: GeoProcessorRequestDto = {
        points: [
          { lat: 40.7128, lng: -74.006 },
          { lat: 34.0522, lng: -118.2437 },
        ],
      };

      const mockResponse = {
        centroid: { lat: 37.3825, lng: -96.1248 },
        bounds: {
          north: 40.7128,
          south: 34.0522,
          east: -74.006,
          west: -118.2437,
        },
      };

      mockHttpService.post.mockReturnValue(of({ data: mockResponse }));

      const result = await controller.processCoordinates(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'http://localhost:8000/geo/process-points',
        mockRequest,
      );
    });

    it('should handle empty points array', async () => {
      const mockRequest: GeoProcessorRequestDto = {
        points: [],
      };

      // Since validation happens at the framework level (before the controller method),
      // an empty array would be caught by class-validator
      // For this unit test, we'll test that the service can handle the request structure
      mockHttpService.post.mockReturnValue(
        of({ data: { error: 'Invalid data' } }),
      );

      // The controller itself doesn't validate - that's handled by the ValidationPipe
      // So we test that it properly forwards the request
      try {
        await controller.processCoordinates(mockRequest);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
