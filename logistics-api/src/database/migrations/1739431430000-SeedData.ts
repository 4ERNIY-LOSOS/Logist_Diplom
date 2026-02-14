import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedData1739431430000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Roles
        const adminRoleId = '866598c9-251a-4d37-817e-9799270b2a75';
        const logisticianRoleId = '77f598c9-251a-4d37-817e-9799270b2a76';
        const clientRoleId = '66e598c9-251a-4d37-817e-9799270b2a77';
        const driverRoleId = '55d598c9-251a-4d37-817e-9799270b2a78';

        await queryRunner.query(`INSERT INTO "roles" (id, name, description) VALUES
            ('${adminRoleId}', 'ADMIN', 'Администратор системы'),
            ('${logisticianRoleId}', 'LOGISTICIAN', 'Логист'),
            ('${clientRoleId}', 'CLIENT', 'Клиент'),
            ('${driverRoleId}', 'DRIVER', 'Водитель')`);

        // Request Statuses
        await queryRunner.query(`INSERT INTO "request_statuses" (id, name, description) VALUES
            (uuid_generate_v4(), 'Новая', 'Заявка только что создана'),
            (uuid_generate_v4(), 'В обработке', 'Заявка обрабатывается логистом'),
            (uuid_generate_v4(), 'Отклонена', 'Заявка отклонена'),
            (uuid_generate_v4(), 'Завершена', 'Заявка выполнена')`);

        // Shipment Statuses
        await queryRunner.query(`INSERT INTO "shipment_statuses" (id, name, description) VALUES
            (uuid_generate_v4(), 'Запланирована', 'Рейс запланирован'),
            (uuid_generate_v4(), 'В пути', 'Груз находится в пути'),
            (uuid_generate_v4(), 'Доставлена', 'Груз доставлен получателю'),
            (uuid_generate_v4(), 'POD получен', 'Документы о доставке подтверждены'),
            (uuid_generate_v4(), 'Отменена', 'Рейс отменен')`);

        // Vehicle Types
        const tentTypeId = 'd1e598c9-251a-4d37-817e-9799270b2a81';
        await queryRunner.query(`INSERT INTO "vehicle_types" (id, name, description) VALUES
            ('${tentTypeId}', 'Тент', 'Грузовик с тентованным кузовом'),
            (uuid_generate_v4(), 'Рефрижератор', 'Грузовик с холодильной установкой'),
            (uuid_generate_v4(), 'Фургон', 'Закрытый жесткий кузов')`);

        // Cargo Types
        await queryRunner.query(`INSERT INTO "cargo_types" (id, name, description, base_multiplier) VALUES
            (uuid_generate_v4(), 'Обычный', 'Стандартный коммерческий груз', 1.0),
            (uuid_generate_v4(), 'Опасный', 'Груз ADR', 1.5),
            (uuid_generate_v4(), 'Температурный', 'Груз, требующий особого режима', 1.3)`);

        // Companies
        const companyId = 'a1e598c9-251a-4d37-817e-9799270b2a79';
        await queryRunner.query(`INSERT INTO "companies" (id, name, tax_id, phone, email) VALUES
            ('${companyId}', 'ООО "Логистика Плюс"', '7701234567', '+74951234567', 'info@logistics-plus.ru')`);

        // Admin User (Password: admin)
        const adminPasswordHash = '$2b$10$7/O6f6H.u7v.yR1V1XF.7Oq8p/oK3Y2zJ5eJ9jFm8g0Pq6O7z9S1u';
        await queryRunner.query(`INSERT INTO "users" (id, username, password, email, first_name, last_name, role_id, company_id, is_email_verified) VALUES
            (uuid_generate_v4(), 'admin', '${adminPasswordHash}', 'admin@axis.logistics', 'Иван', 'Иванов', '${adminRoleId}', '${companyId}', true)`);

        // Sample Logistician
        await queryRunner.query(`INSERT INTO "users" (id, username, password, email, first_name, last_name, role_id, company_id, is_email_verified) VALUES
            (uuid_generate_v4(), 'logistic', '${adminPasswordHash}', 'logistic@axis.logistics', 'Алексей', 'Петров', '${logisticianRoleId}', '${companyId}', true)`);

        // Drivers
        const driverId = 'b1e598c9-251a-4d37-817e-9799270b2a80';
        await queryRunner.query(`INSERT INTO "drivers" (id, first_name, last_name, license_number, phone, status) VALUES
            ('${driverId}', 'Дмитрий', 'Сидоров', '77 12 345678', '+79001112233', 'AVAILABLE')`);

        // Vehicles
        await queryRunner.query(`INSERT INTO "vehicles" (id, license_plate, model, payload_capacity, volume_capacity, status, type_id) VALUES
            (uuid_generate_v4(), 'А777АА77', 'Volvo FH16', 20000, 82, 'AVAILABLE', '${tentTypeId}')`);

        // Default Tariff
        await queryRunner.query(`INSERT INTO "tariffs" (id, name, base_fee, cost_per_km, cost_per_kg, cost_per_m3, is_active) VALUES
            (uuid_generate_v4(), 'Стандартный 2026', 5000, 50, 5, 200, true)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "vehicles"`);
        await queryRunner.query(`DELETE FROM "drivers"`);
        await queryRunner.query(`DELETE FROM "users"`);
        await queryRunner.query(`DELETE FROM "companies"`);
        await queryRunner.query(`DELETE FROM "cargo_types"`);
        await queryRunner.query(`DELETE FROM "vehicle_types"`);
        await queryRunner.query(`DELETE FROM "shipment_statuses"`);
        await queryRunner.query(`DELETE FROM "request_statuses"`);
        await queryRunner.query(`DELETE FROM "roles"`);
    }
}
