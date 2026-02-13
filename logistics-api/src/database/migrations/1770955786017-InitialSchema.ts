import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1770955786017 implements MigrationInterface {
    name = 'InitialSchema1770955786017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Extensions
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Roles
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_c1438905da67119f4d2f094f6c5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_648e3f5447f513d573a6a9774e" ON "roles" ("name") `);

        // Companies
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "address" character varying, "tax_id" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d4c44917631980894569502b4d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_93618451737e408ef7a1f5924b" ON "companies" ("name") `);

        // Users
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "email" character varying NOT NULL, "phone" character varying, "is_active" boolean NOT NULL DEFAULT true, "is_email_verified" boolean NOT NULL DEFAULT false, "email_verification_token" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "role_id" uuid, "company_id" uuid, CONSTRAINT "UQ_fe0bb3f6520ee06412e45330a8a" UNIQUE ("username"), CONSTRAINT "UQ_97672db8860d5294030462006ad" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_97672db8860d5294030462006a" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_f5697669d5828456f91f1a5666" ON "users" ("company_id") `);

        // Request Statuses
        await queryRunner.query(`CREATE TABLE "request_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_512879555132958742b2b1a511e" PRIMARY KEY ("id"))`);

        // Shipment Statuses
        await queryRunner.query(`CREATE TABLE "shipment_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_712879555132958742b2b1a511e" PRIMARY KEY ("id"))`);

        // Vehicle Types
        await queryRunner.query(`CREATE TABLE "vehicle_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "base_cost_per_km" numeric(10,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_912879555132958742b2b1a511e" PRIMARY KEY ("id"))`);

        // Vehicles
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "model" character varying NOT NULL, "license_plate" character varying NOT NULL, "payload_capacity" integer NOT NULL, "volume_capacity" integer NOT NULL, "is_available" boolean NOT NULL DEFAULT true, "status" character varying NOT NULL DEFAULT 'AVAILABLE', "current_lat" double precision, "current_lng" double precision, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "type_id" uuid, CONSTRAINT "UQ_03672db8860d5294030462006ad" UNIQUE ("license_plate"), CONSTRAINT "PK_112879555132958742b2b1a511e" PRIMARY KEY ("id"))`);

        // Drivers
        await queryRunner.query(`CREATE TABLE "drivers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "license_number" character varying NOT NULL, "phone" character varying, "is_available" boolean NOT NULL DEFAULT true, "status" character varying NOT NULL DEFAULT 'AVAILABLE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_13672db8860d5294030462006ad" UNIQUE ("license_number"), CONSTRAINT "PK_212879555132958742b2b1a511e" PRIMARY KEY ("id"))`);

        // Tariffs
        await queryRunner.query(`CREATE TABLE "tariffs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "base_fee" numeric(10,2) NOT NULL DEFAULT '0', "cost_per_km" numeric(10,2) NOT NULL DEFAULT '0', "cost_per_kg" numeric(10,2) NOT NULL DEFAULT '0', "cost_per_m3" numeric(10,2) NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_312879555132958742b2b1a511e" PRIMARY KEY ("id"))`);

        // Addresses
        await queryRunner.query(`CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_address" character varying NOT NULL, "city" character varying, "country" character varying, "latitude" double precision, "longitude" double precision, CONSTRAINT "PK_412879555132958742b2b1a511e" PRIMARY KEY ("id"))`);

        // Warehouses
        await queryRunner.query(`CREATE TABLE "warehouses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address_id" uuid, CONSTRAINT "PK_512879555132958742b2b1a511f" PRIMARY KEY ("id"))`);

        // Requests
        await queryRunner.query(`CREATE TABLE "requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cargo_description" character varying NOT NULL, "weight" double precision NOT NULL, "volume" double precision NOT NULL, "estimated_cost" numeric(10,2), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "client_id" uuid, "status_id" uuid, "pickup_address_id" uuid, "delivery_address_id" uuid, CONSTRAINT "PK_612879555132958742b2b1a511e" PRIMARY KEY ("id"))`);

        // LTL Shipments
        await queryRunner.query(`CREATE TABLE "ltl_shipments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "max_weight" double precision NOT NULL, "max_volume" double precision NOT NULL, "current_weight" double precision NOT NULL DEFAULT '0', "current_volume" double precision NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'OPEN', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_712879555132958742b2b1a511f" PRIMARY KEY ("id"))`);

        // Shipments
        await queryRunner.query(`CREATE TABLE "shipments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "planned_pickup_date" TIMESTAMP WITH TIME ZONE NOT NULL, "planned_delivery_date" TIMESTAMP WITH TIME ZONE NOT NULL, "actual_pickup_date" TIMESTAMP WITH TIME ZONE, "actual_delivery_date" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "request_id" uuid, "driver_id" uuid, "vehicle_id" uuid, "status_id" uuid, "ltl_shipment_id" uuid, CONSTRAINT "PK_812879555132958742b2b1a511e" PRIMARY KEY ("id"), CONSTRAINT "CHK_dates" CHECK ("planned_pickup_date" <= "planned_delivery_date"))`);
        await queryRunner.query(`CREATE INDEX "IDX_812879555132958742b2b1a511" ON "shipments" ("status_id") `);

        // Cargos
        await queryRunner.query(`CREATE TABLE "cargos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "weight" double precision NOT NULL, "volume" double precision NOT NULL, "request_id" uuid, CONSTRAINT "PK_912879555132958742b2b1a511f" PRIMARY KEY ("id"))`);

        // Shipment Route Stops
        await queryRunner.query(`CREATE TABLE "shipment_route_stops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sequence" integer NOT NULL, "planned_arrival" TIMESTAMP WITH TIME ZONE, "actual_arrival" TIMESTAMP WITH TIME ZONE, "type" character varying NOT NULL, "shipment_id" uuid, "address_id" uuid, CONSTRAINT "PK_012879555132958742b2b1a511f" PRIMARY KEY ("id"))`);

        // Shipment Milestones
        await queryRunner.query(`CREATE TABLE "shipment_milestones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_name" character varying NOT NULL, "event_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "location" character varying, "description" character varying, "shipment_id" uuid, CONSTRAINT "PK_112879555132958742b2b1a511f" PRIMARY KEY ("id"))`);

        // Invoices
        await queryRunner.query(`CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_number" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "due_date" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shipment_id" uuid, CONSTRAINT "PK_212879555132958742b2b1a511g" PRIMARY KEY ("id"))`);

        // Audit Logs
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying NOT NULL, "entity_name" character varying NOT NULL, "entity_id" character varying NOT NULL, "old_values" jsonb, "new_values" jsonb, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_312879555132958742b2b1a511g" PRIMARY KEY ("id"))`);

        // Gps Logs
        await queryRunner.query(`CREATE TABLE "gps_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shipment_id" uuid, CONSTRAINT "PK_412879555132958742b2b1a511g" PRIMARY KEY ("id"))`);

        // Notifications
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "message" character varying NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "type" character varying NOT NULL DEFAULT 'INFO', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_512879555132958742b2b1a511g" PRIMARY KEY ("id"))`);

        // Documents
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_name" character varying NOT NULL, "original_name" character varying NOT NULL, "mime_type" character varying NOT NULL, "size" integer NOT NULL, "type" character varying NOT NULL DEFAULT 'OTHER', "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shipment_id" uuid, CONSTRAINT "PK_612879555132958742b2b1a511g" PRIMARY KEY ("id"))`);

        // Foreign Keys
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_vehicle_type" FOREIGN KEY ("type_id") REFERENCES "vehicle_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "warehouses" ADD CONSTRAINT "FK_warehouse_address" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_request_client" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_request_status" FOREIGN KEY ("status_id") REFERENCES "request_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_request_pickup_address" FOREIGN KEY ("pickup_address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_request_delivery_address" FOREIGN KEY ("delivery_address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipment_request" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipment_driver" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipment_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipment_status" FOREIGN KEY ("status_id") REFERENCES "shipment_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipment_ltl" FOREIGN KEY ("ltl_shipment_id") REFERENCES "ltl_shipments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cargos" ADD CONSTRAINT "FK_cargo_request" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipment_route_stops" ADD CONSTRAINT "FK_stop_shipment" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipment_route_stops" ADD CONSTRAINT "FK_stop_address" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD CONSTRAINT "FK_milestone_shipment" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoice_shipment" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gps_logs" ADD CONSTRAINT "FK_gps_shipment" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_notification_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_document_shipment" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "gps_logs"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TABLE "shipment_milestones"`);
        await queryRunner.query(`DROP TABLE "shipment_route_stops"`);
        await queryRunner.query(`DROP TABLE "cargos"`);
        await queryRunner.query(`DROP TABLE "shipments"`);
        await queryRunner.query(`DROP TABLE "ltl_shipments"`);
        await queryRunner.query(`DROP TABLE "requests"`);
        await queryRunner.query(`DROP TABLE "warehouses"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP TABLE "tariffs"`);
        await queryRunner.query(`DROP TABLE "drivers"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP TABLE "vehicle_types"`);
        await queryRunner.query(`DROP TABLE "shipment_statuses"`);
        await queryRunner.query(`DROP TABLE "request_statuses"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }

}
