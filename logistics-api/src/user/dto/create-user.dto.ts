import { IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  role?: string = 'CLIENT'; // Default role

  @IsOptional()
  @IsUUID()
  companyId?: string;
}
