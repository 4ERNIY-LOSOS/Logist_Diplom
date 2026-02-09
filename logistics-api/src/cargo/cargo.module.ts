import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cargo } from './entities/cargo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cargo])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule.forFeature([Cargo])],
})
export class CargoModule {}
