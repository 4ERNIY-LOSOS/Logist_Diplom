import { IsUUID, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateGpsLogDto {
  @IsUUID()
  shipmentId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude: number;

  @IsDateString()
  @Type(() => Date)
  @Transform(({ value }) => value && new Date(value), { toClassOnly: true }) // Convert to Date object, assuming UTC
  timestamp: Date;
}
