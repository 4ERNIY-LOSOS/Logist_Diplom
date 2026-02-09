import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  relatedEntity?: string;

  @IsOptional()
  @IsUUID()
  relatedEntityId?: string;
}
