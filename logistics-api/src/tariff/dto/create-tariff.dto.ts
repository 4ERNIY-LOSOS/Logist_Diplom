import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTariffDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  costPerKm: number;

  @IsNumber()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  costPerKg: number;

  @IsNumber()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  costPerM3: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  baseFee: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
