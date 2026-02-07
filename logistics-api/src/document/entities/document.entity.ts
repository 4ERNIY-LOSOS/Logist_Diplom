
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DocumentType } from './document-type.entity';
import { Shipment } from '../../shipment/entities/shipment.entity';
import { User } from '../../user/entities/user.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DocumentType, (type) => type.documents)
  @JoinColumn({ name: 'type_id' })
  type: DocumentType;

  // A document can belong to a shipment
  @ManyToOne(() => Shipment, (shipment) => shipment.documents, {
    nullable: true,
  })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  // The user who uploaded the document
  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploadedByUser: User;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_path' })
  filePath: string; // Path in a file storage like S3 or local disk

  @Column({ name: 'mime_type' })
  mimeType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
