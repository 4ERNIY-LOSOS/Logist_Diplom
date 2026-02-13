import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Request } from '../../request/entities/request.entity';

@Entity('request_statuses')
export class RequestStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'Новая', 'В обработке', 'Отклонена', 'Завершена'

  @Column({ nullable: true })
  description: string;

  @Exclude()
  @OneToMany(() => Request, (request) => request.status)
  requests: Request[];
}
