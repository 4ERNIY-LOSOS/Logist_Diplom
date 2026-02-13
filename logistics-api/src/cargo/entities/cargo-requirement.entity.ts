import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cargo } from './cargo.entity';

@Entity('cargo_requirements')
export class CargoRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., 'Temperature Control', 'High Security', 'Fragile Handling'

  @Column({ nullable: true })
  value: string; // e.g., '-18C to -22C'

  @Column('decimal', { name: 'surcharge_amount', precision: 10, scale: 2, default: 0 })
  surchargeAmount: number; // Flat fee for this requirement

  @ManyToOne('Cargo', 'requirements', { onDelete: 'CASCADE' })
  cargo: any;
}
