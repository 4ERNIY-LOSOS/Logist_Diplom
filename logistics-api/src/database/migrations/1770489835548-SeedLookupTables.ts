import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedLookupTables1770489835548 implements MigrationInterface {
    name = 'SeedLookupTables1770489835548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO request_statuses (name, description) VALUES
            ('Новая', 'Request has been created by the client'),
            ('В обработке', 'Request is being processed by a logistician'),
            ('Отклонена', 'Request has been rejected'),
            ('Завершена', 'Request has been successfully converted to a shipment');
        `);

        await queryRunner.query(`
            INSERT INTO shipment_statuses (name, description) VALUES
            ('Запланирована', 'Shipment is planned'),
            ('В пути', 'Shipment is on its way'),
            ('На выгрузке', 'Shipment is being unloaded'),
            ('Доставлена', 'Shipment has been delivered'),
            ('Проблема', 'An issue occurred during shipment'),
            ('POD получен', 'Proof of Delivery has been received and confirmed');
        `);

        await queryRunner.query(`
            INSERT INTO vehicle_types (name, description) VALUES
            ('Тент', 'Standard tent truck'),
            ('Рефрижератор', 'Refrigerated truck'),
            ('Фургон', 'Van');
        `);

        await queryRunner.query(`
            INSERT INTO document_types (name, description) VALUES
            ('Счет-фактура', 'Invoice'),
            ('ТТН', 'Transport waybill'),
            ('POD', 'Proof of Delivery');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM request_statuses;`);
        await queryRunner.query(`DELETE FROM shipment_statuses;`);
        await queryRunner.query(`DELETE FROM vehicle_types;`);
        await queryRunner.query(`DELETE FROM document_types;`);
    }

}
