import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { VehicleStatus } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @Min(0)
  payloadCapacity: number; // in kg

  @IsNumber()
  @Min(0)
  volumeCapacity: number; // in m³

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsUUID()
  @IsNotEmpty()
  typeId: string; // ID of the VehicleType

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
