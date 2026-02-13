import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { RoleName } from '../auth/enums/role-name.enum';
import { Shipment } from '../shipment/entities/shipment.entity'; // Import Shipment

@Injectable()
export class DocumentService {
  private readonly uploadDir: string;
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Shipment) // Inject ShipmentRepository
    private shipmentRepository: Repository<Shipment>,
    private configService: ConfigService,
    private userService: UserService,
  ) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    fs.mkdir(this.uploadDir, { recursive: true }).catch((err) =>
      this.logger.error(`Failed to create upload directory: ${err.message}`),
    );
  }

  async create(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto,
  ): Promise<Document> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, fileName);

    try {
      await fs.writeFile(filePath, file.buffer);

      const newDocument = this.documentRepository.create({
        ...createDocumentDto,
        fileName: fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });

      return this.documentRepository.save(newDocument);
    } catch (error) {
      this.logger.error(`Error saving document: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to save document');
    }
  }

  async findOne(id: string, reqUser: any): Promise<Document> {
    const user = await this.userService.findOne(reqUser.userId);
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['shipment', 'shipment.request', 'shipment.request.company'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }

    if (user.role.name === RoleName.CLIENT) {
      if (
        !user.company ||
        !document.shipment ||
        !document.shipment.request ||
        !document.shipment.request.company ||
        document.shipment.request.company.id !== user.company.id
      ) {
        throw new ForbiddenException(
          'You are not authorized to access this document.',
        );
      }
    }

    return document;
  }

  async getFilePath(id: string): Promise<string> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }
    return path.join(this.uploadDir, document.fileName);
  }

  async delete(id: string, reqUser: any): Promise<void> {
    // findOne will perform the authorization check
    const document = await this.findOne(id, reqUser);
    const filePath = path.join(this.uploadDir, document.fileName);

    try {
      await fs.unlink(filePath);
      await this.documentRepository.remove(document);
    } catch (error) {
      this.logger.error(
        `Error deleting document: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete document');
    }
  }

  async findByShipmentId(
    shipmentId: string,
    reqUser: any,
  ): Promise<Document[]> {
    const user = await this.userService.findOne(reqUser.userId);

    // First, verify the user has access to the shipment itself
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['request', 'request.company'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID "${shipmentId}" not found`);
    }

    if (user.role.name === RoleName.CLIENT) {
      if (
        !user.company ||
        !shipment.request ||
        !shipment.request.company ||
        shipment.request.company.id !== user.company.id
      ) {
        throw new ForbiddenException(
          'You are not authorized to access documents for this shipment.',
        );
      }
    }

    return this.documentRepository.find({ where: { shipmentId } });
  }
}
