import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cargo } from './cargo.entity';
import { NumericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('cargo_requirements')
export class CargoRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., 'Temperature Control', 'High Security', 'Fragile Handling'

  @Column({ nullable: true })
  value: string; // e.g., '-18C to -22C'

  @Column('decimal', { name: 'surcharge_amount', precision: 10, scale: 2, default: 0, transformer: new NumericTransformer() })
  surchargeAmount: number; // Flat fee for this requirement

  @ManyToOne('Cargo', 'requirements', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cargo_id' })
  cargo: Cargo;
}
