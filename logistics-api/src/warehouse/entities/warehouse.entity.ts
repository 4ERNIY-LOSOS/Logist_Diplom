import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from '../../address/entities/address.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @OneToOne(() => Address, { cascade: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  capacityWeight: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  capacityVolume: number;

  @Column({ default: true })
  isActive: boolean;
}
