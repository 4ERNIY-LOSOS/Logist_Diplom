import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteColumns1771076215341 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "cargos" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "cargo_requirements" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cargo_requirements" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "cargos" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "deleted_at"`);
    }

}
