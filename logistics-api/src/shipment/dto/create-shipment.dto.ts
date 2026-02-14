import { IsUUID, IsNotEmpty, IsDate, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer'; // Import Type and Transform

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

  @IsDate()
  @Type(() => Date)
  plannedPickupDate: Date;

  @IsDate()
  @Type(() => Date)
  plannedDeliveryDate: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  finalCost: number;
}
