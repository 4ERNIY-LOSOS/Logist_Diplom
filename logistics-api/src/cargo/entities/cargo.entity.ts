import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Request } from '../../request/entities/request.entity';

@Entity('cargos')
export class Cargo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Request, (request) => request.cargos)
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  weight: number; // in kg

  @Column('decimal', { precision: 10, scale: 2 })
  volume: number; // in m³

  @Column()
  type: string; // e.g., 'General', 'Dangerous', 'Perishable'
}
