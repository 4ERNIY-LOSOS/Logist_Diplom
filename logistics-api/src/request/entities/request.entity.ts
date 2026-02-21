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
  DeleteDateColumn,
  Index,
  Check,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
import { Address } from '../../address/entities/address.entity';
import { Cargo } from '../../cargo/entities/cargo.entity';
import { RequestStatus } from './request-status.entity';
import { Shipment } from '../../shipment/entities/shipment.entity';
import { NumericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('requests')
@Check(`"pickup_date" <= "delivery_date"`)
@Check(`"distance_km" >= 0`)
@Check(`"preliminary_cost" >= 0`)
@Check(`"final_cost" >= 0`)
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The user who created the request
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: User;

  // The company this request belongs to
  @Index()
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Index()
  @ManyToOne(() => RequestStatus, (status) => status.requests)
  @JoinColumn({ name: 'status_id' })
  status: RequestStatus;

  @ManyToOne(() => Address, { cascade: true })
  @JoinColumn({ name: 'pickup_address_id' })
  pickupAddress: Address;

  @ManyToOne(() => Address, { cascade: true })
  @JoinColumn({ name: 'delivery_address_id' })
  deliveryAddress: Address;

  @OneToMany(() => Cargo, (cargo) => cargo.request, {
    cascade: true,
  })
  cargos: Cargo[];

  @Exclude()
  @OneToOne(() => Shipment, (shipment) => shipment.request)
  shipment: Shipment;

  @Column({ type: 'timestamptz', name: 'pickup_date' })
  pickupDate: Date;

  @Column({ type: 'timestamptz', name: 'delivery_date' })
  deliveryDate: Date;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'distance_km',
    default: 0,
    transformer: new NumericTransformer(),
  })
  distanceKm: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'preliminary_cost',
    nullable: true,
    transformer: new NumericTransformer(),
  })
  preliminaryCost: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'final_cost',
    nullable: true,
    transformer: new NumericTransformer(),
  })
  finalCost: number;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
