# Logistics System - Setup & Logic Guide

## 1. Database Initialization

Since the project uses TypeORM, you have two ways to initialize the database:

### Option A: Automatic (Recommended for first run)
The `npm run seed` command is configured to automatically synchronize the schema and populate the database with initial data (Roles, Admin, Test Company, Drivers, Vehicles).

```bash
cd logistics-api
npm run seed
```

### Option B: Migrations
If you prefer using migrations:
1. Ensure your database is running (`docker compose up -d`).
2. Generate the initial migration based on the current entities:
   ```bash
   npm run migration:generate -- src/database/migrations/InitialSchema
   ```
3. Run the migration:
   ```bash
   npm run migration:run
   ```

---

## 2. Key Business Logic & Features

### 🚀 LTL Shipment Consolidation
- **Logic**: You can group multiple `Shipments` into one `LTL Shipment`.
- **Status Flow**: When the LTL Shipment moves to "In Transit", all linked shipments automatically update their status.
- **Constraints**: A shipment cannot be added to an LTL load if it's already part of another one or if its status is not "Planned".

### 🛡️ Proof of Delivery (POD) Enforcement
- **Logic**: A shipment **cannot** be marked as "Delivered" until a document of type `PROOF_OF_DELIVERY` is uploaded.
- **Verification**: The system checks for the existence of this document in the database before allowing the status transition.

### 💰 Pricing Engine
- **Dynamic Calculation**: Costs are calculated based on:
  - Base Fee (from active Tariff)
  - Distance (Distance * Cost per Km)
  - Weight & Volume (Total Weight * Cost per Kg + Total Volume * Cost per M3)
  - **Cargo Type Surcharge**: Multipliers applied for Hazardous or Cold Chain cargo.
  - **Special Requirements**: Flat surcharges for specific handling needs.

### 📅 Resource Scheduling & Availability
- **Logic**: Prevent double-booking.
- **Validation**: When creating a shipment, the system checks if the selected Driver and Vehicle are available during the planned time window.
- **Maintenance**: Vehicles scheduled for maintenance are automatically excluded from availability.

### 📊 KPI & Analytics
- **On-Time Delivery (OTD)**: Calculated by comparing `actualDeliveryDate` with `plannedDeliveryDate`.
- **Vehicle Utilization**: Percentage of the fleet currently assigned to active shipments.
- **Financials**: Automatic `Invoice` generation upon successful delivery.

---

## 3. Security Measures
- **Data Leakage Prevention**: All API responses are filtered. Sensitive fields like `password` or `verificationToken` are marked with `@Exclude()` and removed by the global `ClassSerializerInterceptor`.
- **Multitenancy**: Clients are restricted to their own company's data via service-level authorization checks.
- **Audit Logs**: Every state-changing action (POST/PATCH/DELETE) is recorded in the `audit_logs` table with "before/after" details.
