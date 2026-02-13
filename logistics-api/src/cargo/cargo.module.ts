import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cargo } from './entities/cargo.entity';
import { CargoType } from './entities/cargo-type.entity';
import { CargoRequirement } from './entities/cargo-requirement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cargo, CargoType, CargoRequirement])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule.forFeature([Cargo, CargoType, CargoRequirement])],
})
export class CargoModule {}
