import { IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateShipmentStatusDto {
  @IsUUID()
  @IsNotEmpty()
  statusId: string;
}
