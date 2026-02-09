import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The user who receives the notification
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ name: 'related_entity', nullable: true })
  relatedEntity: string; // e.g., 'Request'

  @Column({ name: 'related_entity_id', nullable: true })
  relatedEntityId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
