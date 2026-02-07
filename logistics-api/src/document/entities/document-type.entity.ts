
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Document } from './document.entity';

@Entity('document_types')
export class DocumentType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'Счет-фактура', 'ТТН', 'POD'

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Document, (document) => document.type)
  documents: Document[];
}
