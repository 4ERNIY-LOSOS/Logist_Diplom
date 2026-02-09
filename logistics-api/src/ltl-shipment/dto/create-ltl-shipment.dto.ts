import {
  IsString,
  IsDateString,
  IsArray,
  IsUUID,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer'; // Import Type and Transform

export class CreateLtlShipmentDto {
  @IsString()
  voyageCode: string;

  @IsDateString()
  @Type(() => Date)
  @Transform(({ value }) => value && new Date(value), { toClassOnly: true }) // Convert to Date object, assuming UTC
  departureDate: Date;

  @IsDateString()
  @Type(() => Date)
  @Transform(({ value }) => value && new Date(value), { toClassOnly: true }) // Convert to Date object, assuming UTC
  arrivalDate: Date;

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  shipmentIds: string[]; // IDs of shipments to consolidate
}
