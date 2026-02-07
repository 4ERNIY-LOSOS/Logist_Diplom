import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Add this import
import { RequestModule } from './request/request.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { CompanyModule } from './company/company.module';
import { AddressModule } from './address/address.module';
import { CargoModule } from './cargo/cargo.module';
import { DocumentModule } from './document/document.module';
import { DriverModule } from './driver/driver.module';
import { GpsLogModule } from './gps-log/gps-log.module';
import { LtlShipmentModule } from './ltl-shipment/ltl-shipment.module';
import { NotificationModule } from './notification/notification.module';
import { ShipmentModule } from './shipment/shipment.module';
import { TariffModule } from './tariff/tariff.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { AuditLogModule } from './audit-log/audit-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ // Add this line
      isGlobal: true, // Makes ConfigModule available everywhere
    }),
    TypeOrmModule.forRoot({ // Настройка подключения к БД
      type: 'postgres',
      host: 'localhost',    // Хост, где запущен Docker-контейнер с PostgreSQL
      port: 5432,           // Порт PostgreSQL
      username: 'admin',    // Имя пользователя из docker-compose.yml
      password: 'admin',    // Пароль из docker-compose.yml
      database: 'logistics_db', // Имя БД из docker-compose.yml
      autoLoadEntities: true, // Автоматическая загрузка сущностей (entities)
      synchronize: false,      // Синхронизация схемы БД. ВНИМАНИЕ: Использовать только на dev-окружении!
    }),
    RequestModule,
    UserModule,
    AuthModule,
    RoleModule,
    CompanyModule,
    AddressModule,
    CargoModule,
    DocumentModule,
    DriverModule,
    GpsLogModule,
    LtlShipmentModule,
    NotificationModule,
    ShipmentModule,
    TariffModule,
    VehicleModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
