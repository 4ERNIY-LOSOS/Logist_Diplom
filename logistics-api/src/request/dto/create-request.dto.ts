import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer'; // Ensure Type and Transform are imported
import { CreateAddressDto } from '../../address/dto/create-address.dto';
import { CreateCargoDto } from '../../cargo/dto/create-cargo.dto';

export class CreateRequestDto {
  @IsDateString()
  @Type(() => Date)
  @Transform(({ value }) => value && new Date(value), { toClassOnly: true }) // Convert to Date object, assuming UTC
  pickupDate: Date;

  @IsDateString()
  @Type(() => Date)
  @Transform(({ value }) => value && new Date(value), { toClassOnly: true }) // Convert to Date object, assuming UTC
  deliveryDate: Date;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  pickupAddress: CreateAddressDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  deliveryAddress: CreateAddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCargoDto)
  cargos: CreateCargoDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preliminaryCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  finalCost?: number;

  @IsOptional()
  notes?: string;
}
