import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Shipment } from '../../shipment/entities/shipment.entity';

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  ON_LEAVE = 'ON_LEAVE',
}

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true, name: 'license_number' })
  licenseNumber: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: DriverStatus,
    enumName: 'drivers_status_enum',
    default: DriverStatus.AVAILABLE,
  })
  status: DriverStatus;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Exclude()
  @OneToMany(() => Shipment, (shipment) => shipment.driver)
  shipments: Shipment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}
