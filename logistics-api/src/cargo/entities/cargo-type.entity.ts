import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cargo } from './cargo.entity';

@Entity('cargo_types')
export class CargoType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'Hazardous', 'Cold Chain', 'Standard', 'Fragile'

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 5, scale: 2, default: 1.0 })
  baseMultiplier: number; // Multiplier for pricing

  @OneToMany(() => Cargo, (cargo) => cargo.cargoType)
  cargos: Cargo[];
}
