import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LtlShipment } from './entities/ltl-shipment.entity';
import { CreateLtlShipmentDto } from './dto/create-ltl-shipment.dto';
import { UpdateLtlShipmentDto } from './dto/update-ltl-shipment.dto';
import { Shipment } from '../shipment/entities/shipment.entity';

@Injectable()
export class LtlShipmentService {
  constructor(
    @InjectRepository(LtlShipment)
    private ltlShipmentRepository: Repository<LtlShipment>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
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
  ): Promise<LtlShipment> {
    const { shipmentIds, ...rest } = createLtlShipmentDto;

    const shipments = await this.shipmentRepository.find({
      where: { id: In(shipmentIds) },
      relations: ['request', 'request.cargos'],
    });

    if (shipments.length !== shipmentIds.length) {
      throw new BadRequestException('One or more shipments not found.');
    }

    const ltlShipment = this.ltlShipmentRepository.create(rest);
    ltlShipment.shipments = shipments;

    const { weight, volume } = this._calculateTotals(shipments);
    ltlShipment.consolidatedWeight = weight;
    ltlShipment.consolidatedVolume = volume;

    return this.ltlShipmentRepository.save(ltlShipment);
  }

  findAll(): Promise<LtlShipment[]> {
    return this.ltlShipmentRepository.find({ relations: ['shipments'] });
  }

  async findOne(id: string): Promise<LtlShipment> {
    const ltlShipment = await this.ltlShipmentRepository.findOne({
      where: { id },
      relations: ['shipments'],
    });
    if (!ltlShipment) {
      throw new NotFoundException(`LTL Shipment with ID "${id}" not found`);
    }
    return ltlShipment;
  }

  async update(
    id: string,
    updateLtlShipmentDto: UpdateLtlShipmentDto,
  ): Promise<LtlShipment> {
    const ltlShipment = await this.findOne(id);
    const { shipmentIdsToAdd, shipmentIdsToRemove, ...rest } =
      updateLtlShipmentDto;

    // Update basic fields
    Object.assign(ltlShipment, rest);

    let shipmentsChanged = false;

    // Handle adding shipments
    if (shipmentIdsToAdd && shipmentIdsToAdd.length > 0) {
      const newShipments = await this.shipmentRepository.find({
        where: { id: In(shipmentIdsToAdd) },
        relations: ['request', 'request.cargos'],
      });
      if (newShipments.length !== shipmentIdsToAdd.length) {
        throw new BadRequestException(
          'One or more shipments to add not found.',
        );
      }
      ltlShipment.shipments.push(...newShipments);
      shipmentsChanged = true;
    }

    // Handle removing shipments
    if (shipmentIdsToRemove && shipmentIdsToRemove.length > 0) {
      const originalCount = ltlShipment.shipments.length;
      ltlShipment.shipments = ltlShipment.shipments.filter(
        (shipment) => !shipmentIdsToRemove.includes(shipment.id),
      );
      if (
        ltlShipment.shipments.length !==
        originalCount - shipmentIdsToRemove.length
      ) {
        shipmentsChanged = true;
      }
    }

    // Recalculate totals if shipments were changed
    if (shipmentsChanged) {
      // We need to ensure all shipments have their relations loaded for calculation
      const allShipmentIds = ltlShipment.shipments.map((s) => s.id);
      const allShipmentsWithRelations = await this.shipmentRepository.find({
        where: { id: In(allShipmentIds) },
        relations: ['request', 'request.cargos'],
      });
      ltlShipment.shipments = allShipmentsWithRelations;

      const { weight, volume } = this._calculateTotals(ltlShipment.shipments);
      ltlShipment.consolidatedWeight = weight;
      ltlShipment.consolidatedVolume = volume;
    }

    return this.ltlShipmentRepository.save(ltlShipment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.ltlShipmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`LTL Shipment with ID "${id}" not found`);
    }
  }
}
