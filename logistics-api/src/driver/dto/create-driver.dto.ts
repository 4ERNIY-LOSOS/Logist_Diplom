import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
