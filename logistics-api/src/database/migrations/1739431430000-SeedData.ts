import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedData1739431430000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Roles (Fixed IDs for relational consistency)
        const roles = [
            { id: '866598c9-251a-4d37-817e-9799270b2a75', name: 'ADMIN', description: 'Системный администратор' },
            { id: '77f598c9-251a-4d37-817e-9799270b2a76', name: 'LOGISTICIAN', description: 'Диспетчер-логист' },
            { id: '66e598c9-251a-4d37-817e-9799270b2a77', name: 'CLIENT', description: 'Корпоративный клиент' },
            { id: '55d598c9-251a-4d37-817e-9799270b2a78', name: 'DRIVER', description: 'Водитель-экспедитор' }
        ];

        for (const role of roles) {
            await queryRunner.query(`INSERT INTO "roles" (id, name, description) VALUES ('${role.id}', '${role.name}', '${role.description}') ON CONFLICT (name) DO NOTHING`);
        }

        // Request Statuses
        const requestStatuses = ['Новая', 'В обработке', 'Отклонена', 'Завершена'];
        for (const status of requestStatuses) {
            await queryRunner.query(`INSERT INTO "request_statuses" (id, name) VALUES (uuid_generate_v4(), '${status}') ON CONFLICT (name) DO NOTHING`);
        }

        // Shipment Statuses
        const shipmentStatuses = ['Запланирована', 'Консолидирована', 'В пути', 'Доставлена', 'POD получен', 'Отменена'];
        for (const status of shipmentStatuses) {
            await queryRunner.query(`INSERT INTO "shipment_statuses" (id, name) VALUES (uuid_generate_v4(), '${status}') ON CONFLICT (name) DO NOTHING`);
        }

        // Vehicle Types
        const vehicleTypes = [
            { id: 'd1e598c9-251a-4d37-817e-9799270b2a81', name: 'Тент', description: 'Стандартный тентованный прицеп 82-92 м3' },
            { id: 'd2e598c9-251a-4d37-817e-9799270b2a82', name: 'Рефрижератор', description: 'Холодильная установка (-20/+20)' },
            { id: 'd3e598c9-251a-4d37-817e-9799270b2a83', name: 'Автосцепка', description: 'Большой объем 110-120 м3' }
        ];
        for (const vt of vehicleTypes) {
            await queryRunner.query(`INSERT INTO "vehicle_types" (id, name, description) VALUES ('${vt.id}', '${vt.name}', '${vt.description}') ON CONFLICT (name) DO NOTHING`);
        }

        // Cargo Types
        const cargoTypes = [
            { name: 'Обычный', multiplier: 1.0 },
            { name: 'Опасный (ADR)', multiplier: 1.5 },
            { name: 'Температурный', multiplier: 1.3 },
            { name: 'Хрупкий', multiplier: 1.2 }
        ];
        for (const ct of cargoTypes) {
            await queryRunner.query(`INSERT INTO "cargo_types" (id, name, base_multiplier) VALUES (uuid_generate_v4(), '${ct.name}', ${ct.multiplier}) ON CONFLICT (name) DO NOTHING`);
        }

        // Companies
        const companies = [
            { id: 'a1e598c9-251a-4d37-817e-9799270b2a79', name: 'ООО "Магистраль"', taxId: '7701234567', email: 'info@magistral.ru' },
            { id: 'a2e598c9-251a-4d37-817e-9799270b2a80', name: 'ПАО "ГлобалТранс"', taxId: '7709876543', email: 'contact@globaltrans.com' }
        ];
        for (const comp of companies) {
            await queryRunner.query(`INSERT INTO "companies" (id, name, tax_id, email) VALUES ('${comp.id}', '${comp.name}', '${comp.taxId}', '${comp.email}') ON CONFLICT (name) DO NOTHING`);
        }

        // Users (Password: admin)
        const adminPasswordHash = '$2b$10$U/xO1SICwYO7hSWkQAxFFO8NGJORs8G.rTWdOOGrH2Zt7.7tMInYe';
        const users = [
            { username: 'admin', email: 'admin@axis.logistics', roleId: '866598c9-251a-4d37-817e-9799270b2a75', companyId: 'a1e598c9-251a-4d37-817e-9799270b2a79' },
            { username: 'logistic_1', email: 'log1@axis.logistics', roleId: '77f598c9-251a-4d37-817e-9799270b2a76', companyId: 'a1e598c9-251a-4d37-817e-9799270b2a79' },
            { username: 'client_apple', email: 'logistic@apple.ru', roleId: '66e598c9-251a-4d37-817e-9799270b2a77', companyId: 'a2e598c9-251a-4d37-817e-9799270b2a80' }
        ];
        for (const user of users) {
            await queryRunner.query(`INSERT INTO "users" (id, username, password, email, role_id, company_id, is_email_verified) VALUES (uuid_generate_v4(), '${user.username}', '${adminPasswordHash}', '${user.email}', '${user.roleId}', '${user.companyId}', true) ON CONFLICT (username) DO NOTHING`);
        }

        // Drivers
        const drivers = [
            { first: 'Иван', last: 'Петров', lic: '77 12 111222', phone: '+79001112233' },
            { first: 'Сергей', last: 'Иванов', lic: '77 15 333444', phone: '+79005556677' },
            { first: 'Алексей', last: 'Смирнов', lic: '77 20 888999', phone: '+79110001122' }
        ];
        for (const d of drivers) {
            await queryRunner.query(`INSERT INTO "drivers" (id, first_name, last_name, license_number, phone, status) VALUES (uuid_generate_v4(), '${d.first}', '${d.last}', '${d.lic}', '${d.phone}', 'AVAILABLE') ON CONFLICT (license_number) DO NOTHING`);
        }

        // Vehicles
        const vehicles = [
            { plate: 'A001AA777', model: 'Scania R500', cap: 22000, vol: 86, typeId: 'd1e598c9-251a-4d37-817e-9799270b2a81' },
            { plate: 'B002BB777', model: 'MAN TGX', cap: 20000, vol: 90, typeId: 'd2e598c9-251a-4d37-817e-9799270b2a82' },
            { plate: 'C003CC777', model: 'Volvo FH', cap: 24000, vol: 110, typeId: 'd3e598c9-251a-4d37-817e-9799270b2a83' }
        ];
        for (const v of vehicles) {
            await queryRunner.query(`INSERT INTO "vehicles" (id, license_plate, model, payload_capacity, volume_capacity, type_id, status) VALUES (uuid_generate_v4(), '${v.plate}', '${v.model}', ${v.cap}, ${v.vol}, '${v.typeId}', 'AVAILABLE') ON CONFLICT (license_plate) DO NOTHING`);
        }

        // Default Tariff
        await queryRunner.query(`INSERT INTO "tariffs" (id, name, base_fee, cost_per_km, cost_per_kg, cost_per_m3, is_active) VALUES (uuid_generate_v4(), 'Основной тариф 2026', 5000, 45, 3.5, 150, true) ON CONFLICT (name) DO NOTHING`);

        // Mock Notifications for client_apple
        const clientAppleIdQuery = await queryRunner.query(`SELECT id FROM "users" WHERE username = 'client_apple'`);
        if (clientAppleIdQuery.length > 0) {
            const userId = clientAppleIdQuery[0].id;
            const companyId = 'a2e598c9-251a-4d37-817e-9799270b2a80';
            await queryRunner.query(`INSERT INTO "notifications" (id, message, is_read, user_id) VALUES (uuid_generate_v4(), 'Добро пожаловать в новую панель управления AXIS!', false, '${userId}')`);
            await queryRunner.query(`INSERT INTO "notifications" (id, message, is_read, user_id) VALUES (uuid_generate_v4(), 'Ваша заявка #12345 успешно создана.', true, '${userId}')`);

            // Mock Addresses
            const addr1 = 'b1e598c9-251a-4d37-817e-9799270b2a90';
            const addr2 = 'b1e598c9-251a-4d37-817e-9799270b2a91';
            await queryRunner.query(`INSERT INTO "addresses" (id, country, city, street, house_number, postal_code) VALUES ('${addr1}', 'Россия', 'Москва', 'Тверская', '1', '101000')`);
            await queryRunner.query(`INSERT INTO "addresses" (id, country, city, street, house_number, postal_code) VALUES ('${addr2}', 'Россия', 'Санкт-Петербург', 'Невский', '10', '190000')`);

            // Mock Request
            const statusNewQuery = await queryRunner.query(`SELECT id FROM "request_statuses" WHERE name = 'Новая'`);
            if (statusNewQuery.length > 0) {
                const requestId = 'e1e598c9-251a-4d37-817e-9799270b2a92';
                await queryRunner.query(`INSERT INTO "requests" (id, pickup_date, delivery_date, distance_km, preliminary_cost, created_by_user_id, company_id, status_id, pickup_address_id, delivery_address_id) VALUES ('${requestId}', now(), now() + interval '2 days', 700, 35000, '${userId}', '${companyId}', '${statusNewQuery[0].id}', '${addr1}', '${addr2}')`);

                // Mock Cargo
                const cargoTypeQuery = await queryRunner.query(`SELECT id FROM "cargo_types" LIMIT 1`);
                if (cargoTypeQuery.length > 0) {
                    await queryRunner.query(`INSERT INTO "cargos" (id, name, weight, volume, request_id, cargo_type_id) VALUES (uuid_generate_v4(), 'Оргтехника', 500, 2.5, '${requestId}', '${cargoTypeQuery[0].id}')`);
                }
            }

            // Mock Invoice
            await queryRunner.query(`INSERT INTO "invoices" (id, invoice_number, amount, tax_amount, status, due_date, company_id) VALUES (uuid_generate_v4(), 'INV-2026-001', 35000, 7000, 'SENT', now() + interval '14 days', '${companyId}')`);

            // Mock Active Shipment for Tracking
            const statusTransitQuery = await queryRunner.query(`SELECT id FROM "shipment_statuses" WHERE name = 'В пути'`);
            const driverQuery = await queryRunner.query(`SELECT id FROM "drivers" LIMIT 1`);
            const vehicleQuery = await queryRunner.query(`SELECT id FROM "vehicles" LIMIT 1`);

            if (statusTransitQuery.length > 0 && driverQuery.length > 0 && vehicleQuery.length > 0) {
                const req2Id = 'e1e598c9-251a-4d37-817e-9799270b2a93';
                const shipId = 'f1e598c9-251a-4d37-817e-9799270b2a94';

                await queryRunner.query(`INSERT INTO "requests" (id, pickup_date, delivery_date, distance_km, preliminary_cost, created_by_user_id, company_id, status_id, pickup_address_id, delivery_address_id) VALUES ('${req2Id}', now() - interval '1 day', now() + interval '1 day', 400, 20000, '${userId}', '${companyId}', '${statusNewQuery[0].id}', '${addr1}', '${addr2}')`);
                await queryRunner.query(`INSERT INTO "shipments" (id, planned_pickup_date, planned_delivery_date, request_id, driver_id, vehicle_id, status_id) VALUES ('${shipId}', now() - interval '1 day', now() + interval '1 day', '${req2Id}', '${driverQuery[0].id}', '${vehicleQuery[0].id}', '${statusTransitQuery[0].id}')`);

                // Mock GPS log
                await queryRunner.query(`INSERT INTO "gps_logs" (id, latitude, longitude, timestamp, shipment_id) VALUES (uuid_generate_v4(), 55.7558, 37.6173, now(), '${shipId}')`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "tariffs"`);
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
