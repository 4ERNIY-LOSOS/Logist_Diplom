import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Request } from '../../request/entities/request.entity';
import { Shipment } from '../../shipment/entities/shipment.entity';

export enum DocumentType {
  BILL_OF_LADING = 'BILL_OF_LADING',
  PACKING_LIST = 'PACKING_LIST',
  INVOICE = 'INVOICE',
  PROOF_OF_DELIVERY = 'PROOF_OF_DELIVERY',
  OTHER = 'OTHER',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column()
  size: number;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  type: DocumentType;

  @CreateDateColumn({ type: 'timestamptz', name: 'uploaded_at' })
  uploadedAt: Date;

  @Exclude()
  @ManyToOne(() => Shipment, (shipment) => shipment.documents, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ name: 'shipment_id' })
  shipmentId: string;
}
