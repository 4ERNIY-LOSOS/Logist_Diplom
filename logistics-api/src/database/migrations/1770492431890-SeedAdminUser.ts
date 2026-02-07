import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class SeedAdminUser1770492431890 implements MigrationInterface {
    name = 'SeedAdminUser1770492431890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const password = 'password'; // Default password for initial users
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get Role IDs
        const adminRole = await queryRunner.query(`SELECT id FROM roles WHERE name = 'ADMIN'`);
        const logisticianRole = await queryRunner.query(`SELECT id FROM roles WHERE name = 'LOGISTICIAN'`);

        const adminRoleId = adminRole[0]?.id;
        const logisticianRoleId = logisticianRole[0]?.id;

        if (!adminRoleId || !logisticianRoleId) {
            throw new Error('ADMIN or LOGISTICIAN role not found. Please run the SeedLookupTables migration first.');
        }

        // Insert Admin User
        await queryRunner.query(
            `INSERT INTO users (username, password, email, "role_id") VALUES ($1, $2, $3, $4)`,
            ['admin', hashedPassword, 'admin@example.com', adminRoleId]
        );

        // Insert Logistician User
        await queryRunner.query(
            `INSERT INTO users (username, password, email, "role_id") VALUES ($1, $2, $3, $4)`,
            ['logist', hashedPassword, 'logist@example.com', logisticianRoleId]
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM users WHERE username IN ('admin', 'logist')`);
    }

}
