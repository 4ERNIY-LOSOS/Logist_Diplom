import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateCargoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  weight: number; // in kg

  @IsNumber()
  @Min(0)
  volume: number; // in m³

  @IsString()
  @IsNotEmpty()
  type: string; // e.g., 'General', 'Dangerous', 'Perishable'
}
