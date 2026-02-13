import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Check,
} from 'typeorm';
import { Request } from '../../request/entities/request.entity';
import { CargoType } from './cargo-type.entity';
import { CargoRequirement } from './cargo-requirement.entity';

@Entity('cargos')
@Check(`"weight" >= 0`)
@Check(`"volume" >= 0`)
export class Cargo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Request, (request) => request.cargos)
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  weight: number; // in kg

  @Column('decimal', { precision: 10, scale: 2 })
  volume: number; // in m³

  @ManyToOne(() => CargoType, (type) => type.cargos)
  @JoinColumn({ name: 'cargo_type_id' })
  cargoType: CargoType;

  @OneToMany(() => CargoRequirement, (req) => req.cargo, { cascade: true })
  requirements: CargoRequirement[];
}
