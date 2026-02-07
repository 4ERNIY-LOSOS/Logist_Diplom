import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class SeedAllTestData1770505599020 implements MigrationInterface {
    name = 'SeedAllTestData1770505599020'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- Lookup Tables (ensure already seeded by previous migrations or add here if not) ---
        // Assuming roles, request_statuses, shipment_statuses, vehicle_types, document_types are already present
        // from InitialSchema and SeedLookupTables migrations.
        // We will fetch their IDs.

        const adminRole = await queryRunner.query(`SELECT id FROM roles WHERE name = 'ADMIN'`);
        const logisticianRole = await queryRunner.query(`SELECT id FROM roles WHERE name = 'LOGISTICIAN'`);
        const clientRole = await queryRunner.query(`SELECT id FROM roles WHERE name = 'CLIENT'`);

        const newRequestStatus = await queryRunner.query(`SELECT id FROM request_statuses WHERE name = 'Новая'`);
        const processingRequestStatus = await queryRunner.query(`SELECT id FROM request_statuses WHERE name = 'В обработке'`);
        const completedRequestStatus = await queryRunner.query(`SELECT id FROM request_statuses WHERE name = 'Завершена'`);

        const plannedShipmentStatus = await queryRunner.query(`SELECT id FROM shipment_statuses WHERE name = 'Запланирована'`);
        const inTransitShipmentStatus = await queryRunner.query(`SELECT id FROM shipment_statuses WHERE name = 'В пути'`);
        const deliveredShipmentStatus = await queryRunner.query(`SELECT id FROM shipment_statuses WHERE name = 'Доставлена'`);
        const podReceivedShipmentStatus = await queryRunner.query(`SELECT id FROM shipment_statuses WHERE name = 'POD получен'`);

        const cargoTypeGeneral = 'General'; // These are strings directly in Cargo entity for now
        const cargoTypeDangerous = 'Dangerous';
        const cargoTypePerishable = 'Perishable';

        const tentVehicleType = await queryRunner.query(`SELECT id FROM vehicle_types WHERE name = 'Тент'`);
        const refVehicleType = await queryRunner.query(`SELECT id FROM vehicle_types WHERE name = 'Рефрижератор'`);

        // --- Passwords ---
        const hashedPassword = await bcrypt.hash('password', 10);

        // --- COMPANIES ---
        const company1Id = `gen_random_uuid()`;
        const company2Id = `gen_random_uuid()`;
        await queryRunner.query(
            `INSERT INTO companies (id, name, "tax_id", phone, email) VALUES
            (${company1Id}, 'Грузоперевозки Альфа', '1112223334', '+79001234567', 'info@alfa.com'),
            (${company2Id}, 'Транспорт Бета', '5556667778', '+79007654321', 'contact@beta.net');`
        );

        // --- USERS ---
        // (Admin and Logist are already seeded by SeedAdminUser)
        // Default client user from SeedDefaultClientAndCompany
        // We need to fetch the IDs of the newly inserted companies to link client users
        const insertedCompany1 = await queryRunner.query(`SELECT id FROM companies WHERE name = 'Грузоперевозки Альфа'`);
        const insertedCompany2 = await queryRunner.query(`SELECT id FROM companies WHERE name = 'Транспорт Бета'`);
        const defaultClientCompany = await queryRunner.query(`SELECT id FROM companies WHERE name = 'Default Client Co.'`);

        await queryRunner.query(
            `INSERT INTO users (id, username, password, email, "role_id", "company_id") VALUES
            (gen_random_uuid(), 'client_alfa', $1, 'client_alfa@alfa.com', $2, $3),
            (gen_random_uuid(), 'client_beta', $1, 'client_beta@beta.net', $2, $4);`,
            [hashedPassword, clientRole[0].id, insertedCompany1[0].id, insertedCompany2[0].id]
        );

        // --- DRIVERS ---
        const driver1Id = `gen_random_uuid()`;
        const driver2Id = `gen_random_uuid()`;
        const driver3Id = `gen_random_uuid()`;
        await queryRunner.query(
            `INSERT INTO drivers (id, "first_name", "last_name", "license_number", phone, "isAvailable") VALUES
            (${driver1Id}, 'Иван', 'Иванов', 'AA12345', '+79111111111', TRUE),
            (${driver2Id}, 'Петр', 'Петров', 'BB67890', '+79222222222', TRUE),
            (${driver3Id}, 'Сидор', 'Сидоров', 'CC11223', '+79333333333', FALSE);` // Not available
        );

        // --- VEHICLES ---
        const vehicle1Id = `gen_random_uuid()`;
        const vehicle2Id = `gen_random_uuid()`;
        const vehicle3Id = `gen_random_uuid()`;
        await queryRunner.query(
            `INSERT INTO vehicles (id, "type_id", "license_plate", model, "payload_capacity", "volume_capacity", "isAvailable") VALUES
            (${vehicle1Id}, $1, 'A123BC77', 'Mercedes-Benz Actros', 24000, 90, TRUE),
            (${vehicle2Id}, $2, 'K456LM77', 'Volvo FH16', 22000, 85, TRUE),
            (${vehicle3Id}, $1, 'O789PQ77', 'DAF XF', 20000, 80, FALSE);`, // Not available
            [tentVehicleType[0].id, refVehicleType[0].id]
        );

        // --- ADDRESSES ---
        const address1Id = `gen_random_uuid()`; // Pickup Alfa, Moscow
        const address2Id = `gen_random_uuid()`; // Delivery Alfa, St. Pete
        const address3Id = `gen_random_uuid()`; // Pickup Beta, Kazan
        const address4Id = `gen_random_uuid()`; // Delivery Beta, Samara
        const address5Id = `gen_random_uuid()`; // Pickup for processing request
        const address6Id = `gen_random_uuid()`; // Delivery for processing request
        await queryRunner.query(
            `INSERT INTO addresses (id, country, city, street, "house_number", "postal_code", latitude, longitude) VALUES
            (${address1Id}, 'Россия', 'Москва', 'Ленинградский пр-т', '39', '125167', 55.7954, 37.5372),
            (${address2Id}, 'Россия', 'Санкт-Петербург', 'Невский пр-т', '100', '191025', 59.9329, 30.3609),
            (${address3Id}, 'Россия', 'Казань', 'Проспект Победы', '150', '420100', 55.782, 49.123),
            (${address4Id}, 'Россия', 'Самара', 'Ул. Гагарина', '20', '443079', 53.2001, 50.1500),
            (${address5Id}, 'Россия', 'Екатеринбург', 'Ул. Малышева', '70', '620000', 56.837, 60.601),
            (${address6Id}, 'Россия', 'Тюмень', 'Ул. Республики', '90', '625000', 57.153, 65.534);`
        );

        // --- REQUESTS ---
        const clientAlfa = await queryRunner.query(`SELECT id FROM users WHERE username = 'client_alfa'`);
        const clientBeta = await queryRunner.query(`SELECT id FROM users WHERE username = 'client_beta'`);

        const request1Id = `gen_random_uuid()`; // Alfa, New request
        const request2Id = `gen_random_uuid()`; // Alfa, In processing
        const request3Id = `gen_random_uuid()`; // Beta, Completed
        const request4Id = `gen_random_uuid()`; // For logistician to process
        await queryRunner.query(
            `INSERT INTO requests (id, "created_by_user_id", "company_id", "status_id", "pickup_address_id", "delivery_address_id", "pickup_date", "delivery_date", "preliminary_cost", notes) VALUES
            (${request1Id}, $1, $2, $3, $4, $5, '2026-03-01', '2026-03-05', 15000.00, 'Срочная доставка'),
            (${request2Id}, $1, $2, $6, $4, $5, '2026-03-02', '2026-03-06', 18000.00, 'Хрупкий груз'),
            (${request3Id}, $7, $8, $9, $10, $11, '2026-02-20', '2026-02-25', 25000.00, 'Габаритный груз'),
            (${request4Id}, $1, $2, $3, $12, $13, '2026-03-10', '2026-03-15', 12000.00, 'Стандартный груз');`,
            [
                clientAlfa[0].id, insertedCompany1[0].id, newRequestStatus[0].id, address1Id, address2Id, // Request 1, 2
                processingRequestStatus[0].id, // Request 2 status
                clientBeta[0].id, insertedCompany2[0].id, completedRequestStatus[0].id, address3Id, address4Id, // Request 3
                address5Id, address6Id // Request 4 addresses
            ]
        );

        // --- CARGOS ---
        await queryRunner.query(
            `INSERT INTO cargos (id, "request_id", name, description, weight, volume, type) VALUES
            (gen_random_uuid(), $1, 'Компьютерная техника', 'Мониторы и системные блоки', 500, 5, '${cargoTypeGeneral}'),
            (gen_random_uuid(), $1, 'Офисная мебель', 'Столы и стулья', 300, 8, '${cargoTypeGeneral}'),
            (gen_random_uuid(), $1, 'Опасный груз (аккумуляторы)', 'Литиевые аккумуляторы', 100, 1, '${cargoTypeDangerous}'),
            (gen_random_uuid(), $2, 'Скоропортящиеся продукты', 'Овощи и фрукты', 200, 3, '${cargoTypePerishable}'),
            (gen_random_uuid(), $3, 'Строительные материалы', 'Цемент, кирпичи', 1000, 10, '${cargoTypeGeneral}');`,
            [request1Id, request2Id, request3Id]
        );

        // --- SHIPMENTS ---
        // Some requests are already completed, so create shipments for them.
        const insertedDriver3 = await queryRunner.query(`SELECT id FROM drivers WHERE "license_number" = 'CC11223'`);
        const insertedVehicle3 = await queryRunner.query(`SELECT id FROM vehicles WHERE "license_plate" = 'O789PQ77'`);

        await queryRunner.query(
            `INSERT INTO shipments (id, "request_id", "driver_id", "vehicle_id", "status_id", "planned_pickup_date", "planned_delivery_date", "actual_pickup_date", "actual_delivery_date") VALUES
            (gen_random_uuid(), $1, $2, $3, $4, '2026-02-20', '2026-02-25', '2026-02-20', '2026-02-24');`,
            [
                request3Id, insertedDriver3[0].id, insertedVehicle3[0].id, deliveredShipmentStatus[0].id
            ]
        );

        // --- LTL Shipments (placeholder for now) ---
        // (Will be empty as LTL logic is Phase 3)

        // --- Tariffs (placeholder for now) ---
        // (Will be empty as tariffs logic is Phase 2)

        // --- Notifications & Audit Logs (placeholder for now) ---
        // (Will be empty)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM shipments`);
        await queryRunner.query(`DELETE FROM cargos`);
        await queryRunner.query(`DELETE FROM requests`);
        await queryRunner.query(`DELETE FROM addresses WHERE city IN ('Москва', 'Санкт-Петербург', 'Казань', 'Самара', 'Екатеринбург', 'Тюмень')`);
        await queryRunner.query(`DELETE FROM vehicles WHERE "license_plate" IN ('A123BC77', 'K456LM77', 'O789PQ77')`);
        await queryRunner.query(`DELETE FROM drivers WHERE "license_number" IN ('AA12345', 'BB67890', 'CC11223')`);
        await queryRunner.query(`DELETE FROM users WHERE username IN ('client_alfa', 'client_beta')`);
        await queryRunner.query(`DELETE FROM companies WHERE name IN ('Грузоперевозки Альфа', 'Транспорт Бета')`);
    }

}
