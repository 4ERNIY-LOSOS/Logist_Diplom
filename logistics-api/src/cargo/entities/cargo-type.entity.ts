import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cargo } from './cargo.entity';
import { NumericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('cargo_types')
export class CargoType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'Hazardous', 'Cold Chain', 'Standard', 'Fragile'

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { name: 'base_multiplier', precision: 5, scale: 2, default: 1.0, transformer: new NumericTransformer() })
  baseMultiplier: number; // Multiplier for pricing

  @OneToMany('Cargo', 'cargoType')
  cargos: Cargo[];
}
