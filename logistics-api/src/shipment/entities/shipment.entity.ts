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
import { Request } from '../../request/entities/request.entity';
import { Driver } from '../../driver/entities/driver.entity';
import { Vehicle } from '../../vehicle/entities/vehicle.entity';
import { ShipmentStatus } from './shipment-status.entity';
import { LtlShipment } from '../../ltl-shipment/entities/ltl-shipment.entity';
import { Document } from '../../document/entities/document.entity';
import { GpsLog } from '../../gps-log/entities/gps-log.entity';
import { ShipmentMilestone } from './shipment-milestone.entity';

@Entity('shipments')
@Check(`"planned_pickup_date" <= "planned_delivery_date"`)
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Request, (request) => request.shipment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @ManyToOne(() => Driver, (driver) => driver.shipments)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.shipments)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Index()
  @ManyToOne(() => ShipmentStatus, (status) => status.shipments)
  @JoinColumn({ name: 'status_id' })
  status: ShipmentStatus;

  // For LTL shipments
  @ManyToOne(() => LtlShipment, (ltl) => ltl.shipments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'ltl_shipment_id' })
  ltlShipment: LtlShipment | null;

  @OneToMany(() => Document, (document) => document.shipment)
  documents: Document[];

  @OneToMany(() => GpsLog, (log) => log.shipment)
  gpsLogs: GpsLog[];

  @OneToMany(() => ShipmentMilestone, (milestone) => milestone.shipment)
  milestones: ShipmentMilestone[];

  @Index()
  @Column({ type: 'timestamptz', name: 'planned_pickup_date' })
  plannedPickupDate: Date;

  @Index()
  @Column({ type: 'timestamptz', name: 'planned_delivery_date' })
  plannedDeliveryDate: Date;

  @Column({ type: 'timestamptz', name: 'actual_pickup_date', nullable: true })
  actualPickupDate: Date;

  @Column({ type: 'timestamptz', name: 'actual_delivery_date', nullable: true })
  actualDeliveryDate: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
