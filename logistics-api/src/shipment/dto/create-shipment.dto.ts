import { IsUUID, IsNotEmpty, IsDateString, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer'; // Import Type and Transform

export class CreateShipmentDto {
  @IsUUID()
  @IsNotEmpty()
  requestId: string;

  @IsUUID()
  @IsNotEmpty()
  driverId: string;

  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

  @IsDateString()
  @Type(() => Date)
  @Transform(({ value }) => value && new Date(value), { toClassOnly: true }) // Convert to Date object, assuming UTC
  plannedPickupDate: Date;

  @IsDateString()
  @Type(() => Date)
  @Transform(({ value }) => value && new Date(value), { toClassOnly: true }) // Convert to Date object, assuming UTC
  plannedDeliveryDate: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  finalCost: number;
}
