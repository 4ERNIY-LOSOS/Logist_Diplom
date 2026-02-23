import { MigrationInterface, QueryRunner } from "typeorm";

export class FixShipmentMilestoneSchema1771667910627 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the enum type IF NOT EXISTS
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_milestones_type_enum') THEN
                    CREATE TYPE "shipment_milestones_type_enum" AS ENUM('ARRIVED_AT_PICKUP', 'LOADING_STARTED', 'LOADING_COMPLETED', 'DEPARTED_FROM_PICKUP', 'IN_TRANSIT', 'ARRIVED_AT_DELIVERY', 'UNLOADING_STARTED', 'UNLOADING_COMPLETED', 'POD_UPLOADED', 'DELIVERED');
                END IF;
            END$$;
        `);

        // Get current columns to make the migration idempotent
        const columns = await queryRunner.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'shipment_milestones'
        `);
        const columnNames = columns.map((c: any) => c.column_name);

        // Remove old columns if they exist
        if (columnNames.includes('name')) {
            await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "name"`);
        }
        if (columnNames.includes('description')) {
            await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "description"`);
        }
        if (columnNames.includes('location_lat')) {
            await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "location_lat"`);
        }
        if (columnNames.includes('location_lng')) {
            await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "location_lng"`);
        }

        // Add new columns if they don't exist
        if (!columnNames.includes('type')) {
            await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "type" "shipment_milestones_type_enum" NOT NULL DEFAULT 'IN_TRANSIT'`);
            await queryRunner.query(`ALTER TABLE "shipment_milestones" ALTER COLUMN "type" DROP DEFAULT`);
        }
        if (!columnNames.includes('location')) {
            await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "location" character varying`);
        }
        if (!columnNames.includes('latitude')) {
            await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "latitude" numeric(10,8)`);
        }
        if (!columnNames.includes('longitude')) {
            await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "longitude" numeric(11,8)`);
        }
        if (!columnNames.includes('notes')) {
            await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "notes" character varying`);
        }
        if (!columnNames.includes('created_at')) {
            await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse operations: Check if columns exist before dropping/adding
        const columns = await queryRunner.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'shipment_milestones'
        `);
        const columnNames = columns.map((c: any) => c.column_name);

        if (columnNames.includes('created_at')) await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "created_at"`);
        if (columnNames.includes('notes')) await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "notes"`);
        if (columnNames.includes('longitude')) await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "longitude"`);
        if (columnNames.includes('latitude')) await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "latitude"`);
        if (columnNames.includes('location')) await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "location"`);
        if (columnNames.includes('type')) await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "type"`);

        if (!columnNames.includes('location_lng')) await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "location_lng" numeric(11,8)`);
        if (!columnNames.includes('location_lat')) await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "location_lat" numeric(10,8)`);
        if (!columnNames.includes('description')) await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "description" character varying`);
        if (!columnNames.includes('name')) await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "name" character varying NOT NULL DEFAULT 'Milestone'`);

        // We don't drop the type as it might be used elsewhere or in other migration versions
    }

}
