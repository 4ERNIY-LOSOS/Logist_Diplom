import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';

export enum MilestoneType {
  ARRIVED_AT_PICKUP = 'ARRIVED_AT_PICKUP',
  LOADING_STARTED = 'LOADING_STARTED',
  LOADING_COMPLETED = 'LOADING_COMPLETED',
  DEPARTED_FROM_PICKUP = 'DEPARTED_FROM_PICKUP',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED_AT_DELIVERY = 'ARRIVED_AT_DELIVERY',
  UNLOADING_STARTED = 'UNLOADING_STARTED',
  UNLOADING_COMPLETED = 'UNLOADING_COMPLETED',
  POD_UPLOADED = 'POD_UPLOADED',
  DELIVERED = 'DELIVERED',
}

@Entity('shipment_milestones')
export class ShipmentMilestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shipment, (shipment) => shipment.milestones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({
    type: 'enum',
    enum: MilestoneType,
  })
  type: MilestoneType;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ nullable: true })
  location: string; // Optional location description

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
