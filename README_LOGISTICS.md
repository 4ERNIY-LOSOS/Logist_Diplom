# Logistics System - Setup & Logic Guide

## 🚀 Quick Start (Running the Project)

Follow these steps to get the system up and running from scratch.

### 1. Start the Database
Ensure you have Docker installed and running. This will start the PostgreSQL database.
```bash
docker compose up -d
```

### 2. Initialize the Backend
Open a new terminal and go to the API directory.
```bash
cd logistics-api
npm install
```

### 3. Run Database Migrations
This command will create all tables, constraints, and populate the database with initial data (Admin user, Roles, Statuses, Drivers, Vehicles, etc.).
```bash
npm run db:setup
```
*Note: If you ever need to wipe the database and start over, use `npm run db:reset`.*

### 4. Start the Backend API
```bash
npm run start:dev
```
The API will be available at `http://localhost:3000`. Swagger documentation can be found at `http://localhost:3000/api`.

### 5. Start the Frontend (Client)
Open a new terminal, go to the client directory, and start the development server.
```bash
cd client
npm install --legacy-peer-deps
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## 🔑 Default Credentials

- **Admin Account**:
  - Username: `admin`
  - Password: `admin123`
- **Client Account**:
  - Username: `client`
  - Password: `client123`

---

## 🛠️ Key Commands Summary (logistics-api)

| Command | Description |
|---------|-------------|
| `npm run db:setup` | Runs all migrations and seeds initial data. |
| `npm run db:reset` | Drops the entire schema and reruns all migrations. **(DANGER: Clears all data)** |
| `npm run start:dev` | Starts the NestJS server in watch mode. |
| `npm run seed` | (Legacy) Seeds data via TypeORM synchronize. Use `db:setup` instead. |

---

## 🏗️ Core Business Logic & Features

### 📦 LTL Shipment Consolidation
- **Logic**: Group multiple shipments into a single "Less Than Truckload" unit.
- **Automation**: Updating an LTL Shipment's status propagates to all child shipments.
- **Constraints**: Enforces weight and volume limits for the assigned vehicle.

### 📜 Proof of Delivery (POD)
- **Logic**: Strict enforcement. A shipment **cannot** be marked as "Delivered" until a document of type `PROOF_OF_DELIVERY` is uploaded.

### 💳 Pricing Engine
- **Calculations**: Real-time cost estimation based on distance, weight, volume, cargo type surcharges (Hazardous, Cold Chain), and special requirements.

### 📡 Live Tracking & GPS
- **Simulation**: While in transit, shipments automatically "generate" GPS movements to simulate vehicle progress on the map.

### 🔒 Security & Privacy
- **Audit Logs**: Every state-changing request (POST, PATCH, DELETE) is logged with before/after state comparison.
- **Serialization**: Sensitive data (passwords, tokens) is never returned in API responses.
- **Multi-tenancy**: Client users can only see and manage requests belonging to their company.
