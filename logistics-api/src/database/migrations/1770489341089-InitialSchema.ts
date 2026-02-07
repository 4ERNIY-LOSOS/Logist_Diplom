import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1770489341089 implements MigrationInterface {
    name = 'InitialSchema1770489341089'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vehicle_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_521e89eb074cfce4a101397064f" UNIQUE ("name"), CONSTRAINT "PK_73d1e40f4add7f4f6947acad3a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "description" character varying, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "tax_id" character varying NOT NULL, "phone" character varying, "email" character varying, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3dacbb3eb4f095e29372ff8e131" UNIQUE ("name"), CONSTRAINT "UQ_37777cf58dd19fb6a6f5cf36bc8" UNIQUE ("tax_id"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "email" character varying NOT NULL, "phone" character varying, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "role_id" uuid, "company_id" uuid, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" character varying NOT NULL, "city" character varying NOT NULL, "street" character varying NOT NULL, "house_number" character varying NOT NULL, "apartment" character varying, "postal_code" character varying NOT NULL, "latitude" numeric(10,8), "longitude" numeric(11,8), CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cargos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "weight" numeric(10,2) NOT NULL, "volume" numeric(10,2) NOT NULL, "type" character varying NOT NULL, "request_id" uuid, CONSTRAINT "PK_052f813788106484e4ef7cd1745" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "request_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_a55d6860e990474e9c7ce216681" UNIQUE ("name"), CONSTRAINT "PK_ef199681a6c0dbabd29c07fa9f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pickup_date" TIMESTAMP NOT NULL, "delivery_date" TIMESTAMP NOT NULL, "preliminary_cost" numeric(10,2), "final_cost" numeric(10,2), "notes" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_user_id" uuid, "company_id" uuid, "status_id" uuid, "pickup_address_id" uuid, "delivery_address_id" uuid, CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "drivers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "license_number" character varying NOT NULL, "phone" character varying, "isAvailable" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_47543bd8e5e11a094ded9a56e98" UNIQUE ("license_number"), CONSTRAINT "PK_92ab3fb69e566d3eb0cae896047" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shipment_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_254c2f000fe3d8bdf86c5d3ddac" UNIQUE ("name"), CONSTRAINT "PK_acbb0f530b151493f4c9f5bd5ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ltl_shipments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "voyage_code" character varying NOT NULL, "departure_date" TIMESTAMP NOT NULL, "arrival_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4cc923254d91962c90255d79eb7" UNIQUE ("voyage_code"), CONSTRAINT "PK_b939aa23d3ed8f0de972dd99dd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "document_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_803cd247b7c1c8d91b30a3eb210" UNIQUE ("name"), CONSTRAINT "PK_d467d7eeb7c8ce216e90e8494aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_name" character varying NOT NULL, "file_path" character varying NOT NULL, "mime_type" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type_id" uuid, "shipment_id" uuid, "uploaded_by_user_id" uuid, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "gps_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "latitude" numeric(10,8) NOT NULL, "longitude" numeric(11,8) NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "shipment_id" uuid, CONSTRAINT "PK_bf5a0a9cc743b0fb9b4a5bd70b8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shipments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "planned_pickup_date" TIMESTAMP NOT NULL, "planned_delivery_date" TIMESTAMP NOT NULL, "actual_pickup_date" TIMESTAMP, "actual_delivery_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "request_id" uuid, "driver_id" uuid, "vehicle_id" uuid, "status_id" uuid, "ltl_shipment_id" uuid, CONSTRAINT "REL_c45ea816a7848aa51a7373edc7" UNIQUE ("request_id"), CONSTRAINT "PK_6deda4532ac542a93eab214b564" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "license_plate" character varying NOT NULL, "model" character varying NOT NULL, "payload_capacity" numeric(10,2) NOT NULL, "volume_capacity" numeric(10,2) NOT NULL, "isAvailable" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type_id" uuid, CONSTRAINT "UQ_7e9fab2e8625b63613f67bd706c" UNIQUE ("license_plate"), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tariffs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "cost_per_km" numeric(10,2) NOT NULL, "cost_per_kg" numeric(10,2) NOT NULL, "cost_per_m3" numeric(10,2) NOT NULL, "base_fee" numeric(10,2) NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f32baf8d8b4bb0cf4d7ac97741" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "related_entity" character varying, "related_entity_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action_type" character varying NOT NULL, "entity_name" character varying NOT NULL, "entity_id" character varying NOT NULL, "details" jsonb, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_7ae6334059289559722437bcc1c" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cargos" ADD CONSTRAINT "FK_5d39baea1cae609a4b760dba98d" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_196a8d7d15216f659067b445326" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_7ce411acb524c11f03fa38de9de" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_40439e52fda158f5cced900a7bb" FOREIGN KEY ("status_id") REFERENCES "request_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_2a28c6d9029c92f0177445df762" FOREIGN KEY ("pickup_address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_562230e313955e02f137295c5da" FOREIGN KEY ("delivery_address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_a37895d64f23e673f341125bdeb" FOREIGN KEY ("type_id") REFERENCES "document_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_889a0f64bc98fe026477e527cfb" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_6f8986d1406171fccbd6bb2d864" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gps_logs" ADD CONSTRAINT "FK_f125a3172b040f4b0183b742b11" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_c45ea816a7848aa51a7373edc70" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_eb03f17f7070bb87f741a68684e" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_d3f1fef7a0ec0ca3e1e36d836ea" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_744528580e02c2079df06bf614a" FOREIGN KEY ("status_id") REFERENCES "shipment_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_c26edd146e8b4c49dce871dc145" FOREIGN KEY ("ltl_shipment_id") REFERENCES "ltl_shipments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_218aae238bdeffb5b71b8c82c02" FOREIGN KEY ("type_id") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`
            INSERT INTO roles (name, description) VALUES
            ('ADMIN', 'Administrator with full access'),
            ('LOGISTICIAN', 'Logistics manager, plans and manages shipments'),
            ('CLIENT', 'Corporate client, creates requests');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_218aae238bdeffb5b71b8c82c02"`);
        await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "FK_c26edd146e8b4c49dce871dc145"`);
        await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "FK_744528580e02c2079df06bf614a"`);
        await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "FK_d3f1fef7a0ec0ca3e1e36d836ea"`);
        await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "FK_eb03f17f7070bb87f741a68684e"`);
        await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "FK_c45ea816a7848aa51a7373edc70"`);
        await queryRunner.query(`ALTER TABLE "gps_logs" DROP CONSTRAINT "FK_f125a3172b040f4b0183b742b11"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_6f8986d1406171fccbd6bb2d864"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_889a0f64bc98fe026477e527cfb"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_a37895d64f23e673f341125bdeb"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_562230e313955e02f137295c5da"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_2a28c6d9029c92f0177445df762"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_40439e52fda158f5cced900a7bb"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_7ce411acb524c11f03fa38de9de"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_196a8d7d15216f659067b445326"`);
        await queryRunner.query(`ALTER TABLE "cargos" DROP CONSTRAINT "FK_5d39baea1cae609a4b760dba98d"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_7ae6334059289559722437bcc1c"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "tariffs"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP TABLE "shipments"`);
        await queryRunner.query(`DROP TABLE "gps_logs"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TABLE "document_types"`);
        await queryRunner.query(`DROP TABLE "ltl_shipments"`);
        await queryRunner.query(`DROP TABLE "shipment_statuses"`);
        await queryRunner.query(`DROP TABLE "drivers"`);
        await queryRunner.query(`DROP TABLE "requests"`);
        await queryRunner.query(`DROP TABLE "request_statuses"`);
        await queryRunner.query(`DROP TABLE "cargos"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "vehicle_types"`);
    }

}
