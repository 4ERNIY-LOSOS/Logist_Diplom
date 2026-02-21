import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(data: {
    userId: string;
    actionType: string;
    entityName: string;
    entityId: string;
    details?: object;
  }) {
    const user = new User();
    user.id = data.userId;

    const auditLog = this.auditLogRepository.create({
      user: user,
      actionType: data.actionType,
      entityName: data.entityName,
      entityId: data.entityId,
      details: data.details,
    });
    return this.auditLogRepository.save(auditLog);
  }

  async findAll() {
    return this.auditLogRepository.find({
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }
}
