
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Shipment } from '../../shipment/entities/shipment.entity';

@Entity('ltl_shipments')
export class LtlShipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voyage_code', unique: true })
  voyageCode: string;

  @OneToMany(() => Shipment, (shipment) => shipment.ltlShipment)
  shipments: Shipment[];

  @Column({ name: 'departure_date' })
  departureDate: Date;

  @Column({ name: 'arrival_date' })
  arrivalDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
