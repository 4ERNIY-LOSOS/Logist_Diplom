import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Shipment } from './shipment.entity';

@Entity('shipment_statuses')
export class ShipmentStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'Запланирована', 'В пути', 'Доставлена', 'POD получен'

  @Column({ nullable: true })
  description: string;

  @Exclude()
  @OneToMany(() => Shipment, (shipment) => shipment.status)
  shipments: Shipment[];
}
