import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
import { Address } from '../../address/entities/address.entity';
import { Cargo } from '../../cargo/entities/cargo.entity';
import { RequestStatus } from './request-status.entity';
import { Shipment } from '../../shipment/entities/shipment.entity';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The user who created the request
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: User;

  // The company this request belongs to
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => RequestStatus, (status) => status.requests)
  @JoinColumn({ name: 'status_id' })
  status: RequestStatus;

  @ManyToOne(() => Address, { cascade: true, eager: true })
  @JoinColumn({ name: 'pickup_address_id' })
  pickupAddress: Address;

  @ManyToOne(() => Address, { cascade: true, eager: true })
  @JoinColumn({ name: 'delivery_address_id' })
  deliveryAddress: Address;

  @OneToMany(() => Cargo, (cargo) => cargo.request, {
    cascade: true,
    eager: true,
  })
  cargos: Cargo[];

  @OneToOne(() => Shipment, (shipment) => shipment.request)
  shipment: Shipment;

  @Column({ name: 'pickup_date' })
  pickupDate: Date;

  @Column({ name: 'delivery_date' })
  deliveryDate: Date;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'preliminary_cost',
    nullable: true,
  })
  preliminaryCost: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'final_cost',
    nullable: true,
  })
  finalCost: number;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
