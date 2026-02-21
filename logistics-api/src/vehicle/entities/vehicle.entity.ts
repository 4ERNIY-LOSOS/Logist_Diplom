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
import { Exclude } from 'class-transformer';
import { VehicleType } from './vehicle-type.entity';
import { Shipment } from '../../shipment/entities/shipment.entity';
import { VehicleMaintenance } from './vehicle-maintenance.entity';
import { NumericTransformer } from '../../common/transformers/numeric.transformer';

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => VehicleType, (type) => type.vehicles, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'type_id' })
  type: VehicleType;

  @Column({ unique: true, name: 'license_plate' })
  licensePlate: string;

  @Column()
  model: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'payload_capacity', transformer: new NumericTransformer() })
  payloadCapacity: number; // in kg

  @Column('decimal', { precision: 10, scale: 2, name: 'volume_capacity', transformer: new NumericTransformer() })
  volumeCapacity: number; // in m³

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    enumName: 'vehicles_status_enum',
    default: VehicleStatus.AVAILABLE,
  })
  status: VehicleStatus;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Exclude()
  @OneToMany(() => Shipment, (shipment) => shipment.vehicle)
  shipments: Shipment[];

  @Exclude()
  @OneToMany('VehicleMaintenance', 'vehicle')
  maintenanceLogs: VehicleMaintenance[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}
