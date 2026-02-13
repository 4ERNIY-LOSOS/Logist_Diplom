import { DataSource } from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { RoleName } from '../auth/enums/role-name.enum';
import { RequestStatus } from '../request/entities/request-status.entity';
import { ShipmentStatus } from '../shipment/entities/shipment-status.entity';
import { User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { Driver } from '../driver/entities/driver.entity';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { Tariff } from '../tariff/entities/tariff.entity';
import { Request as CargoRequest } from '../request/entities/request.entity';
import { Shipment } from '../shipment/entities/shipment.entity';
import { Cargo } from '../cargo/entities/cargo.entity';
import { Address } from '../address/entities/address.entity';
import { CargoType } from '../cargo/entities/cargo-type.entity';
import { CargoRequirement } from '../cargo/entities/cargo-requirement.entity';
import { ShipmentMilestone } from '../shipment/entities/shipment-milestone.entity';
import { LtlShipment } from '../ltl-shipment/entities/ltl-shipment.entity';
import { ShipmentRouteStop } from '../ltl-shipment/entities/shipment-route-stop.entity';
import { Warehouse } from '../warehouse/entities/warehouse.entity';
import { Invoice } from '../finance/entities/invoice.entity';
import { AuditLog } from '../audit-log/entities/audit-log.entity';
import { GpsLog } from '../gps-log/entities/gps-log.entity';
import { Notification } from '../notification/entities/notification.entity';
import { VehicleType } from '../vehicle/entities/vehicle-type.entity';
import * as bcrypt from 'bcrypt';
import { dataSourceOptions } from './typeorm.config';

async function seed() {
  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [
        Role, RequestStatus, ShipmentStatus, User, Company, Driver, Vehicle, Tariff,
        CargoRequest, Shipment, Cargo, Address, CargoType, CargoRequirement,
        ShipmentMilestone, LtlShipment, ShipmentRouteStop, Warehouse,
        Invoice, AuditLog, GpsLog, Notification, VehicleType
    ],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('DataSource initialized for seeding');

  const roleRepo = dataSource.getRepository(Role);
  const requestStatusRepo = dataSource.getRepository(RequestStatus);
  const shipmentStatusRepo = dataSource.getRepository(ShipmentStatus);
  const userRepo = dataSource.getRepository(User);
  const companyRepo = dataSource.getRepository(Company);
  const driverRepo = dataSource.getRepository(Driver);
  const vehicleRepo = dataSource.getRepository(Vehicle);
  const tariffRepo = dataSource.getRepository(Tariff);

  // 1. Roles
  const roles = [RoleName.ADMIN, RoleName.LOGISTICIAN, RoleName.CLIENT];
  for (const name of roles) {
    const existing = await roleRepo.findOneBy({ name });
    if (!existing) {
      await roleRepo.save({ name });
      console.log(`Created role: ${name}`);
    }
  }

  // 2. Request Statuses
  const reqStatuses = ['Новая', 'Обработка', 'Завершена', 'Отменена'];
  for (const name of reqStatuses) {
    const existing = await requestStatusRepo.findOneBy({ name });
    if (!existing) {
      await requestStatusRepo.save({ name });
      console.log(`Created request status: ${name}`);
    }
  }

  // 3. Shipment Statuses
  const shipStatuses = ['Запланирована', 'В пути', 'Доставлена', 'Отменена', 'Консолидирована'];
  for (const name of shipStatuses) {
    const existing = await shipmentStatusRepo.findOneBy({ name });
    if (!existing) {
      await shipmentStatusRepo.save({ name });
      console.log(`Created shipment status: ${name}`);
    }
  }

  // 4. Companies
  let companyA = await companyRepo.findOneBy({ name: 'ООО Ромашка' });
  if (!companyA) {
    companyA = await companyRepo.save({
        name: 'ООО Ромашка',
        email: 'info@romashka.ru',
        phone: '123456789',
        taxId: '1234567890'
    });
    console.log('Created company A');
  }

  // 5. Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await userRepo.findOneBy({ username: 'admin' });
  if (!admin) {
    const adminRole = await roleRepo.findOneBy({ name: RoleName.ADMIN });
    if (adminRole) {
        await userRepo.save({
          username: 'admin',
          password: adminPassword,
          email: 'admin@logistics.com',
          role: adminRole,
          isEmailVerified: true,
        });
        console.log('Created admin user');
    }
  }

  const clientPassword = await bcrypt.hash('client123', 10);
  const clientUser = await userRepo.findOneBy({ username: 'client' });
  if (!clientUser) {
    const clientRole = await roleRepo.findOneBy({ name: RoleName.CLIENT });
    if (clientRole && companyA) {
        await userRepo.save({
          username: 'client',
          password: clientPassword,
          email: 'client@romashka.ru',
          role: clientRole,
          company: companyA,
          isEmailVerified: true,
        });
        console.log('Created client user');
    }
  }

  // 6. Drivers
  const driversCount = await driverRepo.count();
  if (driversCount === 0) {
    await driverRepo.save([
      { firstName: 'Иван', lastName: 'Иванов', licenseNumber: '77AA123456', isAvailable: true },
      { firstName: 'Петр', lastName: 'Петров', licenseNumber: '77BB654321', isAvailable: true },
    ]);
    console.log('Created drivers');
  }

  // 7. Vehicles
  const vehiclesCount = await vehicleRepo.count();
  if (vehiclesCount === 0) {
    await vehicleRepo.save([
      { model: 'KAMAZ-54901', licensePlate: 'A111AA77', payloadCapacity: 20000, volumeCapacity: 80, isAvailable: true },
      { model: 'GAZelle NEXT', licensePlate: 'B222BB77', payloadCapacity: 1500, volumeCapacity: 12, isAvailable: true },
    ]);
    console.log('Created vehicles');
  }

  // 8. Tariff
  const activeTariff = await tariffRepo.findOneBy({ isActive: true });
  if (!activeTariff) {
    await tariffRepo.save({
      name: 'Базовый тариф',
      baseFee: 5000,
      costPerKm: 30,
      costPerKg: 2,
      costPerM3: 500,
      isActive: true
    });
    console.log('Created active tariff');
  }

  await dataSource.destroy();
  console.log('Seeding completed successfully');
}

seed().catch(err => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
