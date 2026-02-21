import { MigrationInterface, QueryRunner } from "typeorm";

export class FixShipmentMilestoneSchema1771667910627 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the enum type
        await queryRunner.query(`CREATE TYPE "shipment_milestones_type_enum" AS ENUM('ARRIVED_AT_PICKUP', 'LOADING_STARTED', 'LOADING_COMPLETED', 'DEPARTED_FROM_PICKUP', 'IN_TRANSIT', 'ARRIVED_AT_DELIVERY', 'UNLOADING_STARTED', 'UNLOADING_COMPLETED', 'POD_UPLOADED', 'DELIVERED')`);

        // Remove old columns
        await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "location_lat"`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "location_lng"`);

        // Add new columns
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "type" "shipment_milestones_type_enum" NOT NULL DEFAULT 'IN_TRANSIT'`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "location" character varying`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "latitude" numeric(10,8)`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "longitude" numeric(11,8)`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "notes" character varying`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);

        // Remove default for type after adding it (optional, but cleaner if we want to force explicit types)
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ALTER COLUMN "type" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove new columns
        await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" DROP COLUMN "type"`);

        // Add back old columns
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "location_lng" numeric(11,8)`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "location_lat" numeric(10,8)`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD "name" character varying NOT NULL DEFAULT 'Milestone'`);

        // Drop enum type
        await queryRunner.query(`DROP TYPE "shipment_milestones_type_enum"`);
    }

}
