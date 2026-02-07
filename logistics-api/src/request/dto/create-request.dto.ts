import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from '../../address/dto/create-address.dto';
import { CreateCargoDto } from '../../cargo/dto/create-cargo.dto';

export class CreateRequestDto {
  @IsDateString()
  pickupDate: Date;

  @IsDateString()
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
  preliminaryCost?: number;

  @IsOptional()
  notes?: string;
}
