import {
  IsDate,
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
  @IsDate()
  @Type(() => Date)
  pickupDate: Date;

  @IsDate()
  @Type(() => Date)
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
