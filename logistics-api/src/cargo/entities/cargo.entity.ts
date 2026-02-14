import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Check,
  DeleteDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Request } from '../../request/entities/request.entity';
import { CargoType } from './cargo-type.entity';
import { CargoRequirement } from './cargo-requirement.entity';
import { NumericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('cargos')
@Check(`"weight" >= 0`)
@Check(`"volume" >= 0`)
export class Cargo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @ManyToOne(() => Request, (request) => request.cargos)
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, transformer: new NumericTransformer() })
  weight: number; // in kg

  @Column('decimal', { precision: 10, scale: 2, transformer: new NumericTransformer() })
  volume: number; // in m³

  @ManyToOne('CargoType', 'cargos')
  @JoinColumn({ name: 'cargo_type_id' })
  cargoType: CargoType;

  @OneToMany('CargoRequirement', 'cargo', { cascade: true })
  requirements: CargoRequirement[];

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
