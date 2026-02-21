import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('vehicle_types')
export class VehicleType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'Тент', 'Рефрижератор', 'Фургон'

  @Column({ nullable: true })
  description: string;

  @OneToMany('Vehicle', 'type')
  vehicles: Vehicle[];
}
