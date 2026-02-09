import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { DocumentType } from '../entities/document.entity';

export class CreateDocumentDto {
  @IsString()
  fileName: string; // The name of the file on the server (e.g., UUID.ext)

  @IsString()
  originalName: string; // The original name of the file

  @IsString()
  mimeType: string;

  @IsNumber()
  size: number;

  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType = DocumentType.OTHER;

  @IsOptional()
  @IsUUID()
  requestId?: string;

  @IsOptional()
  @IsUUID()
  shipmentId?: string;
}
