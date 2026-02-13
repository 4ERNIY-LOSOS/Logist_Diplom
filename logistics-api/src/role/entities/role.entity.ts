import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../user/entities/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string; // e.g., 'ADMIN', 'LOGISTICIAN', 'CLIENT'

  @Column({ nullable: true })
  description: string;

  @Exclude()
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
