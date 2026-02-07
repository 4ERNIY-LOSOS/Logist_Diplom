import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GpsLog } from './entities/gps-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GpsLog])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule.forFeature([GpsLog])],
})
export class GpsLogModule {}