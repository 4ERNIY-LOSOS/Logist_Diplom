import {
  IsString,
  IsDate,
  IsArray,
  IsUUID,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer'; // Import Type and Transform

export class CreateLtlShipmentDto {
  @IsString()
  voyageCode: string;

  @IsDate()
  @Type(() => Date)
  departureDate: Date;

  @IsDate()
  @Type(() => Date)
  arrivalDate: Date;

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  shipmentIds: string[]; // IDs of shipments to consolidate

  @IsOptional()
  id?: any;

  @IsOptional()
  status?: any;

  @IsOptional()
  consolidatedWeight?: any;

  @IsOptional()
  consolidatedVolume?: any;

  @IsOptional()
  shipments?: any;

  @IsOptional()
  createdAt?: any;

  @IsOptional()
  updatedAt?: any;
}
