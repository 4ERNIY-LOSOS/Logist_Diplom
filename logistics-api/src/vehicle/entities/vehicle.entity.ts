import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VehicleType } from './vehicle-type.entity';
import { Shipment } from '../../shipment/entities/shipment.entity';

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => VehicleType, (type) => type.vehicles)
  @JoinColumn({ name: 'type_id' })
  type: VehicleType;

  @Column({ unique: true, name: 'license_plate' })
  licensePlate: string;

  @Column()
  model: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'payload_capacity' })
  payloadCapacity: number; // in kg

  @Column('decimal', { precision: 10, scale: 2, name: 'volume_capacity' })
  volumeCapacity: number; // in m³

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
  })
  status: VehicleStatus;

  @Column({ default: true })
  isAvailable: boolean;

  @OneToMany(() => Shipment, (shipment) => shipment.vehicle)
  shipments: Shipment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}
