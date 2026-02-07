import { IsUUID, IsNotEmpty, IsDateString } from 'class-validator';

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
  plannedPickupDate: Date;

  @IsDateString()
  plannedDeliveryDate: Date;
}
