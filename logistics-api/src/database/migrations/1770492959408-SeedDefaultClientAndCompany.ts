import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class SeedDefaultClientAndCompany1770492959408 implements MigrationInterface {
    name = 'SeedDefaultClientAndCompany1770492959408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const password = 'password'; // Default password for initial client
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert Default Company
        await queryRunner.query(
            `INSERT INTO companies (id, name, "tax_id", email) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id`,
            ['Default Client Co.', '0000000001', 'client_co@example.com']
        ).then(res => {
            (queryRunner as any).insertedCompanyId = res[0].id; // Store company ID for client user
        });

        // Get Client Role ID
        const clientRole = await queryRunner.query(`SELECT id FROM roles WHERE name = 'CLIENT'`);
        const clientRoleId = clientRole[0]?.id;

        if (!clientRoleId) {
            throw new Error('CLIENT role not found. Please run the InitialSchema or SeedLookupTables migration first.');
        }

        // Insert Default Client User
        await queryRunner.query(
            `INSERT INTO users (username, password, email, "role_id", "company_id") VALUES ($1, $2, $3, $4, $5)`,
            ['client', hashedPassword, 'client@example.com', clientRoleId, (queryRunner as any).insertedCompanyId]
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM users WHERE username = 'client'`);
        await queryRunner.query(`DELETE FROM companies WHERE "tax_id" = '0000000001'`);
    }

}
