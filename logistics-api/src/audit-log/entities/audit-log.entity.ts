
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'action_type' })
  actionType: string; // e.g., 'CREATE_REQUEST', 'UPDATE_STATUS'

  @Column({ name: 'entity_name' })
  entityName: string; // e.g., 'Request'

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column('jsonb', { nullable: true })
  details: object; // To store before/after state, for example

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}
