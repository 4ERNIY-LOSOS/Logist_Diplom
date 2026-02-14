import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';
import { NumericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('tariffs')
@Check(`"cost_per_km" >= 0`)
@Check(`"cost_per_kg" >= 0`)
@Check(`"cost_per_m3" >= 0`)
@Check(`"base_fee" >= 0`)
export class Tariff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Cost per kilometer
  @Column('decimal', { precision: 10, scale: 2, name: 'cost_per_km', transformer: new NumericTransformer() })
  costPerKm: number;

  // Cost per kilogram
  @Column('decimal', { precision: 10, scale: 2, name: 'cost_per_kg', transformer: new NumericTransformer() })
  costPerKg: number;

  // Cost per cubic meter
  @Column('decimal', { precision: 10, scale: 2, name: 'cost_per_m3', transformer: new NumericTransformer() })
  costPerM3: number;

  // Base fee for any shipment
  @Column('decimal', { precision: 10, scale: 2, name: 'base_fee', default: 0, transformer: new NumericTransformer() })
  baseFee: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
