import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Shipment } from '../../shipment/entities/shipment.entity';

@Entity('gps_logs')
export class GpsLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shipment, (shipment) => shipment.gpsLogs)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'timestamptz', name: 'timestamp' })
  timestamp: Date;
}
