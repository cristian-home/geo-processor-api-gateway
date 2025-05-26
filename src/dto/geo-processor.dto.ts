import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

export class CoordinateDto {
  @IsNumber({}, { message: 'Latitude must be a number' })
  lat: number;

  @IsNumber({}, { message: 'Longitude must be a number' })
  lng: number;
}

export class GeoProcessorRequestDto {
  @IsArray({ message: 'Points must be an array' })
  @ArrayMinSize(1, { message: 'Points array cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => CoordinateDto)
  points: CoordinateDto[];
}

export class CentroidDto {
  lat: number;
  lng: number;
}

export class BoundsDto {
  north: number;
  south: number;
  east: number;
  west: number;
}

export class GeoProcessorResponseDto {
  centroid: CentroidDto;
  bounds: BoundsDto;
}
