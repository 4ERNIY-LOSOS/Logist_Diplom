import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, EntityManager } from 'typeorm';
import { LtlShipment } from './entities/ltl-shipment.entity';
import { CreateLtlShipmentDto } from './dto/create-ltl-shipment.dto';
import { UpdateLtlShipmentDto } from './dto/update-ltl-shipment.dto';
import { Shipment } from '../shipment/entities/shipment.entity';
import { ShipmentStatus } from '../shipment/entities/shipment-status.entity';
import { LtlShipmentStatus } from './enums/ltl-shipment-status.enum';
import { Document, DocumentType } from '../document/entities/document.entity';
import { UserService } from '../user/user.service';
import { RoleName } from '../auth/enums/role-name.enum';

@Injectable()
export class LtlShipmentService {
  constructor(
    @InjectRepository(LtlShipment)
    private ltlShipmentRepository: Repository<LtlShipment>,
    private readonly entityManager: EntityManager,
    private readonly userService: UserService,
  ) {}

  private _calculateTotals(shipments: Shipment[]): {
    weight: number;
    volume: number;
  } {
    let weight = 0;
    let volume = 0;

    for (const shipment of shipments) {
      if (shipment.request && shipment.request.cargos) {
        for (const cargo of shipment.request.cargos) {
          weight += Number(cargo.weight);
          volume += Number(cargo.volume);
        }
      }
    }
    return { weight, volume };
  }

  async create(
    createLtlShipmentDto: CreateLtlShipmentDto,
    user: any,
  ): Promise<LtlShipment> {
    const { shipmentIds, ...rest } = createLtlShipmentDto;
    const logistician = await this.userService.findOne(user.userId);

    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const plannedStatus = await transactionalEntityManager.findOne(
          ShipmentStatus,
          {
            where: { name: 'Запланирована' },
          },
        );
        const consolidatedStatus = await transactionalEntityManager.findOne(
          ShipmentStatus,
          {
            where: { name: 'Консолидирована' },
          },
        );

        if (!plannedStatus || !consolidatedStatus) {
          throw new Error(
            'Required shipment statuses (Запланирована, Консолидирована) not found in the database.',
          );
        }

        const shipments = await transactionalEntityManager.find(Shipment, {
          where: { id: In(shipmentIds) },
          relations: [
            'request',
            'request.cargos',
            'status',
            'request.company',
          ],
          lock: { mode: 'pessimistic_write' },
        });

        if (shipments.length !== shipmentIds.length) {
          throw new BadRequestException('One or more shipments not found.');
        }

        for (const shipment of shipments) {
          if (
            logistician.role.name === RoleName.LOGISTICIAN &&
            shipment.request.company?.id !== logistician.company?.id
          ) {
            throw new ForbiddenException(
              `You do not have permission to manage shipment with ID "${shipment.id}".`,
            );
          }
          if (shipment.ltlShipment) {
            throw new BadRequestException(
              `Shipment with ID "${shipment.id}" is already part of another LTL shipment.`,
            );
          }
          if (shipment.status.id !== plannedStatus.id) {
            throw new BadRequestException(
              `Shipment with ID "${shipment.id}" is not in 'Запланирована' status.`,
            );
          }
        }

        const ltlShipment = transactionalEntityManager.create(LtlShipment, {
          ...rest,
          status: LtlShipmentStatus.CONSOLIDATING,
        });

        const { weight, volume } = this._calculateTotals(shipments);
        ltlShipment.consolidatedWeight = weight;
        ltlShipment.consolidatedVolume = volume;

        const savedLtlShipment = await transactionalEntityManager.save(
          ltlShipment,
        );

        for (const shipment of shipments) {
          shipment.ltlShipment = savedLtlShipment;
          shipment.status = consolidatedStatus;
        }

        await transactionalEntityManager.save(shipments);

        savedLtlShipment.shipments = shipments;
        return savedLtlShipment;
      },
    );
  }

  findAll(): Promise<LtlShipment[]> {
    return this.ltlShipmentRepository.find({ relations: ['shipments'] });
  }

  async findOne(id: string): Promise<LtlShipment> {
    const ltlShipment = await this.ltlShipmentRepository.findOne({
      where: { id },
      relations: ['shipments', 'shipments.status', 'shipments.request.company'],
    });
    if (!ltlShipment) {
      throw new NotFoundException(`LTL Shipment with ID "${id}" not found`);
    }
    return ltlShipment;
  }

  async updateStatus(id: string, status: LtlShipmentStatus): Promise<LtlShipment> {
    return this.entityManager.transaction(async (transactionalEntityManager) => {
        const ltlShipment = await transactionalEntityManager.findOne(LtlShipment, {
            where: { id },
            relations: ['shipments', 'shipments.status']
        });

        if (!ltlShipment) {
            throw new NotFoundException(`LTL Shipment with ID "${id}" not found`);
        }

        const inTransitStatus = await transactionalEntityManager.findOne(ShipmentStatus, { where: { name: 'В пути' } });
        const deliveredStatus = await transactionalEntityManager.findOne(ShipmentStatus, { where: { name: 'Доставлена' } });

        if (!inTransitStatus || !deliveredStatus) {
            throw new Error('Required shipment statuses not found.');
        }

        ltlShipment.status = status;

        if (status === LtlShipmentStatus.IN_TRANSIT) {
            for (const shipment of ltlShipment.shipments) {
                shipment.status = inTransitStatus;
            }
        } else if (status === LtlShipmentStatus.COMPLETED) {
            for (const shipment of ltlShipment.shipments) {
                // Enforce POD check for each shipment in the LTL load
                const pod = await transactionalEntityManager.findOne(Document, {
                    where: {
                        shipment: { id: shipment.id },
                        type: DocumentType.PROOF_OF_DELIVERY
                    }
                });
                if (!pod) {
                    throw new BadRequestException(`Cannot complete LTL shipment: Shipment ${shipment.id.substring(0,8)} is missing a POD document.`);
                }
                shipment.status = deliveredStatus;
                shipment.actualDeliveryDate = new Date();
                if (shipment.request && (shipment.request.finalCost === null || shipment.request.finalCost === undefined)) {
                    shipment.request.finalCost = shipment.request.preliminaryCost;
                    await transactionalEntityManager.save(shipment.request);
                }
            }
        }

        await transactionalEntityManager.save(ltlShipment.shipments);
        return transactionalEntityManager.save(ltlShipment);
    });
  }

  async update(
    id: string,
    updateLtlShipmentDto: UpdateLtlShipmentDto,
    user: any,
  ): Promise<LtlShipment> {
    const logistician = await this.userService.findOne(user.userId);

    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const ltlShipment = await transactionalEntityManager.findOne(
          LtlShipment,
          {
            where: { id },
            relations: ['shipments', 'shipments.request.company'],
            lock: { mode: 'pessimistic_write' },
          },
        );

        if (!ltlShipment) {
          throw new NotFoundException(`LTL Shipment with ID "${id}" not found`);
        }
        if (ltlShipment.status !== LtlShipmentStatus.CONSOLIDATING) {
          throw new BadRequestException(
            `Cannot modify LTL shipment with status "${ltlShipment.status}".`,
          );
        }
        if (
          logistician.role.name === RoleName.LOGISTICIAN &&
          !ltlShipment.shipments.some(
            (s) => s.request.company?.id === logistician.company?.id,
          )
        ) {
          throw new ForbiddenException(
            'You do not have permission to manage this LTL shipment.',
          );
        }
        
        const { shipmentIdsToAdd, shipmentIdsToRemove, ...rest } =
          updateLtlShipmentDto;

        const plannedStatus = await transactionalEntityManager.findOne(
          ShipmentStatus,
          { where: { name: 'Запланирована' } },
        );
        const consolidatedStatus = await transactionalEntityManager.findOne(
          ShipmentStatus,
          { where: { name: 'Консолидирована' } },
        );
        if (!plannedStatus || !consolidatedStatus) {
          throw new Error('Required shipment statuses not found.');
        }

        // Handle removals
        if (shipmentIdsToRemove && shipmentIdsToRemove.length > 0) {
          const shipmentsToRemove = ltlShipment.shipments.filter((s) =>
            shipmentIdsToRemove.includes(s.id),
          );
          for (const shipment of shipmentsToRemove) {
            shipment.ltlShipment = null as any;
            shipment.status = plannedStatus;
          }
          await transactionalEntityManager.save(shipmentsToRemove);
          ltlShipment.shipments = ltlShipment.shipments.filter(
            (s) => !shipmentIdsToRemove.includes(s.id),
          );
        }

        // Handle additions
        if (shipmentIdsToAdd && shipmentIdsToAdd.length > 0) {
          const shipmentsToAdd = await transactionalEntityManager.find(
            Shipment,
            {
              where: { id: In(shipmentIdsToAdd) },
              relations: ['status', 'request', 'request.company', 'request.cargos'],
            },
          );
          if (shipmentsToAdd.length !== shipmentIdsToAdd.length) {
            throw new BadRequestException('One or more shipments to add not found.');
          }
          for (const shipment of shipmentsToAdd) {
            if (
              logistician.role.name === RoleName.LOGISTICIAN &&
              shipment.request.company?.id !== logistician.company?.id
            ) {
              throw new ForbiddenException(
                `You do not have permission to add shipment with ID "${shipment.id}".`,
              );
            }
            if (shipment.ltlShipment) {
              throw new BadRequestException(
                `Shipment with ID "${shipment.id}" is already in another LTL shipment.`,
              );
            }
            if (shipment.status.id !== plannedStatus.id) {
              throw new BadRequestException(
                `Shipment with ID "${shipment.id}" is not in 'Запланирована' status.`,
              );
            }
            shipment.ltlShipment = ltlShipment;
            shipment.status = consolidatedStatus;
          }
          await transactionalEntityManager.save(shipmentsToAdd);
          ltlShipment.shipments.push(...shipmentsToAdd);
        }

        Object.assign(ltlShipment, rest);

        const { weight, volume } = this._calculateTotals(ltlShipment.shipments);
        ltlShipment.consolidatedWeight = weight;
        ltlShipment.consolidatedVolume = volume;
        
        return transactionalEntityManager.save(ltlShipment);
      },
    );
  }

  async remove(id: string, user: any): Promise<void> {
    const logistician = await this.userService.findOne(user.userId);
    
    await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const ltlShipment = await transactionalEntityManager.findOne(
          LtlShipment,
          {
            where: { id },
            relations: ['shipments', 'shipments.request.company'],
          },
        );

        if (!ltlShipment) {
          throw new NotFoundException(`LTL Shipment with ID "${id}" not found`);
        }

        if (
          logistician.role.name === RoleName.LOGISTICIAN &&
          !ltlShipment.shipments.some(
            (s) => s.request.company?.id === logistician.company?.id,
          )
        ) {
          throw new ForbiddenException(
            'You do not have permission to delete this LTL shipment.',
          );
        }

        if (ltlShipment.status !== LtlShipmentStatus.CONSOLIDATING) {
          throw new BadRequestException(
            `Cannot delete LTL shipment with status "${ltlShipment.status}".`,
          );
        }

        const plannedStatus = await transactionalEntityManager.findOne(
          ShipmentStatus,
          {
            where: { name: 'Запланирована' },
          },
        );
        if (!plannedStatus) {
          throw new Error('Required "Запланирована" status not found.');
        }

        if (ltlShipment.shipments && ltlShipment.shipments.length > 0) {
          for (const shipment of ltlShipment.shipments) {
            shipment.ltlShipment = null as any;
            shipment.status = plannedStatus;
          }
          await transactionalEntityManager.save(ltlShipment.shipments);
        }

        await transactionalEntityManager.remove(ltlShipment);
      },
    );
  }
}
