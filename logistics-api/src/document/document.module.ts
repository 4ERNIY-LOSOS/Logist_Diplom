import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { DocumentType } from './entities/document-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, DocumentType])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule.forFeature([Document, DocumentType])],
})
export class DocumentModule {}