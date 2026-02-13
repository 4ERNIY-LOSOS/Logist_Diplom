import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Add this import
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
import { ReportsModule } from './reports/reports.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './audit-log/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      // Add this line
      isGlobal: true, // Makes ConfigModule available everywhere
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'admin'),
        password: configService.get<string>('DB_PASSWORD', 'admin'),
        database: configService.get<string>('DB_DATABASE', 'logistics_db'),
        autoLoadEntities: true,
        synchronize: false, // ВНИМАНИЕ: Использовать только на dev-окружении!
      }),
      inject: [ConfigService],
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
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
