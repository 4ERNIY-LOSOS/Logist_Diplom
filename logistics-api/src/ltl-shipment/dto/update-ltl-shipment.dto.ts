import { PartialType } from '@nestjs/swagger';
import { CreateLtlShipmentDto } from './create-ltl-shipment.dto';
import { IsUUID, IsArray, IsOptional } from 'class-validator';

export class UpdateLtlShipmentDto extends PartialType(CreateLtlShipmentDto) {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  shipmentIdsToAdd?: string[]; // Shipments to add to this LTL shipment

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  shipmentIdsToRemove?: string[]; // Shipments to remove from this LTL shipment
}
