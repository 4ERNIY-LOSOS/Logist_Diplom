import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class SeedData1770955856102 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Roles
        await queryRunner.query(`INSERT INTO "roles" (name) VALUES ('ADMIN'), ('LOGISTICIAN'), ('CLIENT')`);

        // 2. Request Statuses
        await queryRunner.query(`INSERT INTO "request_statuses" (name) VALUES ('Новая'), ('Обработка'), ('Завершена'), ('Отменена')`);

        // 3. Shipment Statuses
        await queryRunner.query(`INSERT INTO "shipment_statuses" (name) VALUES ('Запланирована'), ('В пути'), ('Доставлена'), ('Отменена'), ('Консолидирована')`);

        // 4. Companies
        await queryRunner.query(`INSERT INTO "companies" (name, email, phone, tax_id) VALUES ('ООО Ромашка', 'info@romashka.ru', '123456789', '1234567890')`);

        // 5. Admin User
        const adminPassword = await bcrypt.hash('admin123', 10);
        await queryRunner.query(`
            INSERT INTO "users" (username, password, email, is_email_verified, role_id)
            SELECT 'admin', '${adminPassword}', 'admin@logistics.com', true, id FROM "roles" WHERE name = 'ADMIN'
        `);

        // 6. Client User
        const clientPassword = await bcrypt.hash('client123', 10);
        await queryRunner.query(`
            INSERT INTO "users" (username, password, email, is_email_verified, role_id, company_id)
            SELECT 'client', '${clientPassword}', 'client@romashka.ru', true, r.id, c.id
            FROM "roles" r, "companies" c
            WHERE r.name = 'CLIENT' AND c.name = 'ООО Ромашка'
        `);

        // 7. Drivers
        await queryRunner.query(`INSERT INTO "drivers" (first_name, last_name, license_number, is_available) VALUES ('Иван', 'Иванов', '77AA123456', true), ('Петр', 'Петров', '77BB654321', true)`);

        // 8. Vehicles
        await queryRunner.query(`INSERT INTO "vehicles" (model, license_plate, payload_capacity, volume_capacity, is_available) VALUES ('KAMAZ-54901', 'A111AA77', 20000, 80, true), ('GAZelle NEXT', 'B222BB77', 1500, 12, true)`);

        // 9. Tariff
        await queryRunner.query(`INSERT INTO "tariffs" (name, base_fee, cost_per_km, cost_per_kg, cost_per_m3, is_active) VALUES ('Базовый тариф', 5000, 30, 2, 500, true)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "tariffs"`);
        await queryRunner.query(`DELETE FROM "vehicles"`);
        await queryRunner.query(`DELETE FROM "drivers"`);
        await queryRunner.query(`DELETE FROM "users"`);
        await queryRunner.query(`DELETE FROM "companies"`);
        await queryRunner.query(`DELETE FROM "shipment_statuses"`);
        await queryRunner.query(`DELETE FROM "request_statuses"`);
        await queryRunner.query(`DELETE FROM "roles"`);
    }

}
