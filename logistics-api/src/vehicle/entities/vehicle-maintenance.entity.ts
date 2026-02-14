import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { NumericTransformer } from '../../common/transformers/numeric.transformer';

export enum MaintenanceType {
  ROUTINE = 'ROUTINE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
}

@Entity('vehicle_maintenance')
export class VehicleMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Vehicle', 'maintenanceLogs', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
    enumName: 'vehicle_maintenance_type_enum',
  })
  type: MaintenanceType;

  @Column({ type: 'timestamptz', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamptz', name: 'end_date', nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: new NumericTransformer() })
  cost: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
