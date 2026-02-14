import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1739431420000 implements MigrationInterface {
    name = 'InitialSchema1739431420000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        // Enums
        await queryRunner.query(`CREATE TYPE "vehicles_status_enum" AS ENUM('AVAILABLE', 'BUSY', 'MAINTENANCE')`);
        await queryRunner.query(`CREATE TYPE "drivers_status_enum" AS ENUM('AVAILABLE', 'BUSY', 'ON_LEAVE')`);
        await queryRunner.query(`CREATE TYPE "documents_type_enum" AS ENUM('BILL_OF_LADING', 'PACKING_LIST', 'INVOICE', 'PROOF_OF_DELIVERY', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "ltl_shipments_status_enum" AS ENUM('Формируется', 'В пути', 'Завершен', 'Отменен')`);
        await queryRunner.query(`CREATE TYPE "vehicle_maintenance_type_enum" AS ENUM('ROUTINE', 'REPAIR', 'INSPECTION')`);
        await queryRunner.query(`CREATE TYPE "invoices_status_enum" AS ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED')`);

        // Roles
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "description" character varying, CONSTRAINT "UQ_roles_name" UNIQUE ("name"), CONSTRAINT "PK_roles" PRIMARY KEY ("id"))`);

        // Companies
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "tax_id" character varying NOT NULL, "phone" character varying, "email" character varying, "address" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_companies_name" UNIQUE ("name"), CONSTRAINT "UQ_companies_tax_id" UNIQUE ("tax_id"), CONSTRAINT "PK_companies" PRIMARY KEY ("id"))`);

        // Users
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "email" character varying NOT NULL, "phone" character varying, "is_active" boolean NOT NULL DEFAULT true, "is_email_verified" boolean NOT NULL DEFAULT false, "email_verification_token" character varying, "role_id" uuid, "company_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_users_username" UNIQUE ("username"), CONSTRAINT "UQ_users_email" UNIQUE ("email"), CONSTRAINT "PK_users" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_company_id" ON "users" ("company_id")`);

        // Addresses
        await queryRunner.query(`CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" character varying NOT NULL, "city" character varying NOT NULL, "street" character varying NOT NULL, "house_number" character varying NOT NULL, "apartment" character varying, "postal_code" character varying NOT NULL, "latitude" numeric(10,8), "longitude" numeric(11,8), CONSTRAINT "PK_addresses" PRIMARY KEY ("id"))`);

        // Request Statuses
        await queryRunner.query(`CREATE TABLE "request_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_request_statuses_name" UNIQUE ("name"), CONSTRAINT "PK_request_statuses" PRIMARY KEY ("id"))`);

        // Vehicle Types
        await queryRunner.query(`CREATE TABLE "vehicle_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_vehicle_types_name" UNIQUE ("name"), CONSTRAINT "PK_vehicle_types" PRIMARY KEY ("id"))`);

        // Vehicles
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "license_plate" character varying NOT NULL, "model" character varying NOT NULL, "payload_capacity" numeric(10,2) NOT NULL, "volume_capacity" numeric(10,2) NOT NULL, "status" "vehicles_status_enum" NOT NULL DEFAULT 'AVAILABLE', "is_available" boolean NOT NULL DEFAULT true, "type_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_vehicles_license_plate" UNIQUE ("license_plate"), CONSTRAINT "PK_vehicles" PRIMARY KEY ("id"))`);

        // Drivers
        await queryRunner.query(`CREATE TABLE "drivers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "license_number" character varying NOT NULL, "phone" character varying, "status" "drivers_status_enum" NOT NULL DEFAULT 'AVAILABLE', "is_available" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_drivers_license_number" UNIQUE ("license_number"), CONSTRAINT "PK_drivers" PRIMARY KEY ("id"))`);

        // Cargo Types
        await queryRunner.query(`CREATE TABLE "cargo_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "base_multiplier" numeric(5,2) NOT NULL DEFAULT '1.0', CONSTRAINT "UQ_cargo_types_name" UNIQUE ("name"), CONSTRAINT "PK_cargo_types" PRIMARY KEY ("id"))`);

        // Requests
        await queryRunner.query(`CREATE TABLE "requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pickup_date" TIMESTAMP WITH TIME ZONE NOT NULL, "delivery_date" TIMESTAMP WITH TIME ZONE NOT NULL, "distance_km" numeric(10,2) NOT NULL DEFAULT '0', "preliminary_cost" numeric(10,2), "final_cost" numeric(10,2), "notes" character varying, "created_by_user_id" uuid, "company_id" uuid, "status_id" uuid, "pickup_address_id" uuid, "delivery_address_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_requests" PRIMARY KEY ("id"), CONSTRAINT "CHK_requests_dates" CHECK ("pickup_date" <= "delivery_date"), CONSTRAINT "CHK_requests_distance" CHECK ("distance_km" >= 0), CONSTRAINT "CHK_requests_preliminary_cost" CHECK ("preliminary_cost" >= 0), CONSTRAINT "CHK_requests_final_cost" CHECK ("final_cost" >= 0))`);
        await queryRunner.query(`CREATE INDEX "IDX_requests_company_id" ON "requests" ("company_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_requests_status_id" ON "requests" ("status_id")`);

        // Cargos
        await queryRunner.query(`CREATE TABLE "cargos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "weight" numeric(10,2) NOT NULL, "volume" numeric(10,2) NOT NULL, "request_id" uuid, "cargo_type_id" uuid, CONSTRAINT "PK_cargos" PRIMARY KEY ("id"), CONSTRAINT "CHK_cargos_weight" CHECK ("weight" >= 0), CONSTRAINT "CHK_cargos_volume" CHECK ("volume" >= 0))`);

        // Cargo Requirements
        await queryRunner.query(`CREATE TABLE "cargo_requirements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "value" character varying, "surcharge_amount" numeric(10,2) NOT NULL DEFAULT '0', "cargo_id" uuid, CONSTRAINT "PK_cargo_requirements" PRIMARY KEY ("id"))`);

        // Shipment Statuses
        await queryRunner.query(`CREATE TABLE "shipment_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_shipment_statuses_name" UNIQUE ("name"), CONSTRAINT "PK_shipment_statuses" PRIMARY KEY ("id"))`);

        // LTL Shipments
        await queryRunner.query(`CREATE TABLE "ltl_shipments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "voyage_code" character varying NOT NULL, "status" "ltl_shipments_status_enum" NOT NULL DEFAULT 'Формируется', "departure_date" TIMESTAMP WITH TIME ZONE NOT NULL, "arrival_date" TIMESTAMP WITH TIME ZONE NOT NULL, "consolidated_weight" numeric(12,2) NOT NULL DEFAULT '0', "consolidated_volume" numeric(12,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ltl_shipments_voyage_code" UNIQUE ("voyage_code"), CONSTRAINT "PK_ltl_shipments" PRIMARY KEY ("id"))`);

        // Shipments
        await queryRunner.query(`CREATE TABLE "shipments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "planned_pickup_date" TIMESTAMP WITH TIME ZONE NOT NULL, "planned_delivery_date" TIMESTAMP WITH TIME ZONE NOT NULL, "actual_pickup_date" TIMESTAMP WITH TIME ZONE, "actual_delivery_date" TIMESTAMP WITH TIME ZONE, "request_id" uuid, "driver_id" uuid, "vehicle_id" uuid, "status_id" uuid, "ltl_shipment_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_shipments" PRIMARY KEY ("id"), CONSTRAINT "UQ_shipments_request_id" UNIQUE ("request_id"), CONSTRAINT "CHK_shipments_dates" CHECK ("planned_pickup_date" <= "planned_delivery_date"))`);
        await queryRunner.query(`CREATE INDEX "IDX_shipments_status_id" ON "shipments" ("status_id")`);

        // Shipment Route Stops
        await queryRunner.query(`CREATE TABLE "shipment_route_stops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stop_order" integer NOT NULL, "planned_arrival" TIMESTAMP WITH TIME ZONE NOT NULL, "actual_arrival" TIMESTAMP WITH TIME ZONE, "ltl_shipment_id" uuid, "address_id" uuid, CONSTRAINT "PK_shipment_route_stops" PRIMARY KEY ("id"))`);

        // Shipment Milestones
        await queryRunner.query(`CREATE TABLE "shipment_milestones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "location_lat" numeric(10,8), "location_lng" numeric(11,8), "shipment_id" uuid, CONSTRAINT "PK_shipment_milestones" PRIMARY KEY ("id"))`);

        // Documents
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_name" character varying NOT NULL, "original_name" character varying NOT NULL, "mime_type" character varying NOT NULL, "size" integer NOT NULL, "type" "documents_type_enum" NOT NULL DEFAULT 'OTHER', "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shipment_id" uuid NOT NULL, CONSTRAINT "PK_documents" PRIMARY KEY ("id"))`);

        // GPS Logs
        await queryRunner.query(`CREATE TABLE "gps_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "latitude" numeric(10,8) NOT NULL, "longitude" numeric(11,8) NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "shipment_id" uuid, CONSTRAINT "PK_gps_logs" PRIMARY KEY ("id"))`);

        // Audit Logs
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action_type" character varying NOT NULL, "entity_name" character varying NOT NULL, "entity_id" character varying NOT NULL, "details" jsonb, "user_id" uuid, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id"))`);

        // Tariffs
        await queryRunner.query(`CREATE TABLE "tariffs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "base_fee" numeric(10,2) NOT NULL DEFAULT '0', "cost_per_km" numeric(10,2) NOT NULL, "cost_per_kg" numeric(10,2) NOT NULL, "cost_per_m3" numeric(10,2) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_tariffs_name" UNIQUE ("name"), CONSTRAINT "PK_tariffs" PRIMARY KEY ("id"))`);

        // Warehouses
        await queryRunner.query(`CREATE TABLE "warehouses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "capacity_m3" numeric(10,2) NOT NULL, "address_id" uuid, CONSTRAINT "PK_warehouses" PRIMARY KEY ("id"))`);

        // Invoices
        await queryRunner.query(`CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_number" character varying NOT NULL, "amount" numeric(12,2) NOT NULL, "tax_amount" numeric(12,2) NOT NULL DEFAULT '0', "status" "invoices_status_enum" NOT NULL DEFAULT 'DRAFT', "due_date" TIMESTAMP WITH TIME ZONE NOT NULL, "paid_date" TIMESTAMP WITH TIME ZONE, "shipment_id" uuid, "company_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_invoices_invoice_number" UNIQUE ("invoice_number"), CONSTRAINT "PK_invoices" PRIMARY KEY ("id"))`);

        // Vehicle Maintenance
        await queryRunner.query(`CREATE TABLE "vehicle_maintenance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "vehicle_maintenance_type_enum" NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE, "description" character varying, "cost" numeric(10,2) NOT NULL DEFAULT '0', "vehicle_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_vehicle_maintenance" PRIMARY KEY ("id"))`);

        // Foreign Keys
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_roles" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_companies" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_vehicles_types" FOREIGN KEY ("type_id") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_requests_users" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_requests_companies" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_requests_statuses" FOREIGN KEY ("status_id") REFERENCES "request_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_requests_pickup_address" FOREIGN KEY ("pickup_address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_requests_delivery_address" FOREIGN KEY ("delivery_address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cargos" ADD CONSTRAINT "FK_cargos_requests" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cargos" ADD CONSTRAINT "FK_cargos_types" FOREIGN KEY ("cargo_type_id") REFERENCES "cargo_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cargo_requirements" ADD CONSTRAINT "FK_cargo_requirements_cargos" FOREIGN KEY ("cargo_id") REFERENCES "cargos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipments_requests" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipments_drivers" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipments_vehicles" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipments_statuses" FOREIGN KEY ("status_id") REFERENCES "shipment_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipments_ltl" FOREIGN KEY ("ltl_shipment_id") REFERENCES "ltl_shipments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipment_route_stops" ADD CONSTRAINT "FK_shipment_route_stops_ltl" FOREIGN KEY ("ltl_shipment_id") REFERENCES "ltl_shipments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipment_route_stops" ADD CONSTRAINT "FK_shipment_route_stops_address" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipment_milestones" ADD CONSTRAINT "FK_shipment_milestones_shipments" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_documents_shipments" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gps_logs" ADD CONSTRAINT "FK_gps_logs_shipments" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_logs_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "warehouses" ADD CONSTRAINT "FK_warehouses_addresses" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_companies" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_shipments" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicle_maintenance" ADD CONSTRAINT "FK_vehicle_maintenance_vehicles" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order
        await queryRunner.query(`DROP TABLE "vehicle_maintenance"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TABLE "warehouses"`);
        await queryRunner.query(`DROP TABLE "tariffs"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "gps_logs"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TABLE "shipment_milestones"`);
        await queryRunner.query(`DROP TABLE "shipment_route_stops"`);
        await queryRunner.query(`DROP TABLE "shipments"`);
        await queryRunner.query(`DROP TABLE "ltl_shipments"`);
        await queryRunner.query(`DROP TABLE "shipment_statuses"`);
        await queryRunner.query(`DROP TABLE "cargo_requirements"`);
        await queryRunner.query(`DROP TABLE "cargos"`);
        await queryRunner.query(`DROP TABLE "requests"`);
        await queryRunner.query(`DROP TABLE "cargo_types"`);
        await queryRunner.query(`DROP TABLE "drivers"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP TABLE "vehicle_types"`);
        await queryRunner.query(`DROP TABLE "request_statuses"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP TABLE "roles"`);

        // Drop Enums
        await queryRunner.query(`DROP TYPE "invoices_status_enum"`);
        await queryRunner.query(`DROP TYPE "vehicle_maintenance_type_enum"`);
        await queryRunner.query(`DROP TYPE "ltl_shipments_status_enum"`);
        await queryRunner.query(`DROP TYPE "documents_type_enum"`);
        await queryRunner.query(`DROP TYPE "drivers_status_enum"`);
        await queryRunner.query(`DROP TYPE "vehicles_status_enum"`);
    }
}
