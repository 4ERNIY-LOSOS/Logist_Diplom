import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Shipment } from '../../shipment/entities/shipment.entity';
import { LtlShipmentStatus } from '../enums/ltl-shipment-status.enum';
import { ShipmentRouteStop } from './shipment-route-stop.entity';

@Entity('ltl_shipments')
export class LtlShipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voyage_code', unique: true })
  voyageCode: string;

  @Column({
    type: 'enum',
    enum: LtlShipmentStatus,
    default: LtlShipmentStatus.CONSOLIDATING,
  })
  status: LtlShipmentStatus;

  @OneToMany('Shipment', 'ltlShipment')
  shipments: Shipment[];

  @OneToMany('ShipmentRouteStop', 'ltlShipment', { cascade: true })
  routeStops: ShipmentRouteStop[];

  @Column({ type: 'timestamptz', name: 'departure_date' })
  departureDate: Date;

  @Column({ type: 'timestamptz', name: 'arrival_date' })
  arrivalDate: Date;

  @Column('decimal', {
    name: 'consolidated_weight',
    precision: 12,
    scale: 2,
    default: 0,
  })
  consolidatedWeight: number;

  @Column('decimal', {
    name: 'consolidated_volume',
    precision: 12,
    scale: 2,
    default: 0,
  })
  consolidatedVolume: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
