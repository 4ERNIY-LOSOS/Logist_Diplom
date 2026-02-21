import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { LtlShipment } from '../../ltl-shipment/entities/ltl-shipment.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

@Entity('shipment_route_stops')
export class ShipmentRouteStop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @ManyToOne('LtlShipment', 'routeStops', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ltl_shipment_id' })
  ltlShipment: LtlShipment;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'int', name: 'stop_order' })
  stopOrder: number;

  @Column({ type: 'timestamptz', name: 'planned_arrival', nullable: true })
  plannedArrival: Date;

  @Column({ type: 'timestamptz', name: 'actual_arrival', nullable: true })
  actualArrival: Date;

  @Column({ type: 'timestamptz', name: 'planned_departure', nullable: true })
  plannedDeparture: Date;

  @Column({ type: 'timestamptz', name: 'actual_departure', nullable: true })
  actualDeparture: Date;

  @Column({ nullable: true })
  notes: string;
}
