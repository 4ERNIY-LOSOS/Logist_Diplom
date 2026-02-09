import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tariffs')
export class Tariff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Cost per kilometer
  @Column('decimal', { precision: 10, scale: 2, name: 'cost_per_km' })
  costPerKm: number;

  // Cost per kilogram
  @Column('decimal', { precision: 10, scale: 2, name: 'cost_per_kg' })
  costPerKg: number;

  // Cost per cubic meter
  @Column('decimal', { precision: 10, scale: 2, name: 'cost_per_m3' })
  costPerM3: number;

  // Base fee for any shipment
  @Column('decimal', { precision: 10, scale: 2, name: 'base_fee', default: 0 })
  baseFee: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
