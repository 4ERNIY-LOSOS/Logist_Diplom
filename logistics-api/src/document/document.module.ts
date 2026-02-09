import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { Shipment } from '../shipment/entities/shipment.entity'; // Import Shipment entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Shipment]), // Add Shipment here
    ConfigModule,
    UserModule,
  ],
  providers: [DocumentService],
  controllers: [DocumentController],
  exports: [DocumentService],
})
export class DocumentModule {}
