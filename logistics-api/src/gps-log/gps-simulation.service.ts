import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../shipment/entities/shipment.entity';
import { GpsLog } from './entities/gps-log.entity';

@Injectable()
export class GpsSimulationService implements OnModuleInit {
  private readonly logger = new Logger(GpsSimulationService.name);

  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(GpsLog)
    private gpsLogRepository: Repository<GpsLog>,
  ) {}

  onModuleInit() {
    this.logger.log('GPS Simulation Service initialized. Starting simulation loop...');
    // Simulate every 10 seconds
    setInterval(() => this.simulateMovement(), 10000);
  }

  async simulateMovement() {
    const activeShipments = await this.shipmentRepository.find({
      where: { status: { name: 'В пути' } },
      relations: ['request', 'request.pickupAddress', 'request.deliveryAddress', 'gpsLogs'],
    });

    for (const shipment of activeShipments) {
      if (!shipment.request?.pickupAddress || !shipment.request?.deliveryAddress) {
        continue;
      }

      if (shipment.request.pickupAddress.latitude === null || shipment.request.pickupAddress.longitude === null ||
          shipment.request.deliveryAddress.latitude === null || shipment.request.deliveryAddress.longitude === null) {
          continue;
      }

      const startLat = Number(shipment.request.pickupAddress.latitude);
      const startLng = Number(shipment.request.pickupAddress.longitude);
      const endLat = Number(shipment.request.deliveryAddress.latitude);
      const endLng = Number(shipment.request.deliveryAddress.longitude);

      if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) continue;

      // Find latest log
      const latestLog = await this.gpsLogRepository.findOne({
        where: { shipment: { id: shipment.id } },
        order: { timestamp: 'DESC' },
      });

      let currentLat = latestLog ? Number(latestLog.latitude) : startLat;
      let currentLng = latestLog ? Number(latestLog.longitude) : startLng;

      // Move 1% towards destination
      const step = 0.01;
      const newLat = currentLat + (endLat - currentLat) * step;
      const newLng = currentLng + (endLng - currentLng) * step;

      // Only save if we haven't reached destination (or very close)
      const dist = Math.sqrt(Math.pow(endLat - newLat, 2) + Math.pow(endLng - newLng, 2));

      if (dist > 0.0001) {
        await this.gpsLogRepository.save({
          shipment: shipment,
          latitude: newLat,
          longitude: newLng,
          timestamp: new Date(),
        });
        this.logger.debug(`Updated GPS for Shipment ${shipment.id}: ${newLat}, ${newLng}`);
      }
    }
  }
}
