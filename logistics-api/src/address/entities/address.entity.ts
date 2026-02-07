
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  street: string;

  @Column({ name: 'house_number' })
  houseNumber: string;

  @Column({ nullable: true })
  apartment: string;

  @Column({ name: 'postal_code' })
  postalCode: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;
}
