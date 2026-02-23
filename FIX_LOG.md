# AXIS Logistics System Audit & Refactor Fix Log

## Backend Refactors (logistics-api)

### 1. Database & Migrations
- **InitialSchema.ts**: Implemented comprehensive schema with normalized relations, foreign keys, and indexes. Added standard PostgreSQL enums.
- **SeedData.ts**: Created high-fidelity seed data for Roles, Statuses, Vehicle Types, Cargo Types, Companies, and default Users.
- **typeorm.config.ts**: Established a standalone configuration for TypeORM CLI to support production-grade migrations.
- **NumericTransformer**: Added to all decimal columns to ensure the API returns `number` types instead of `string`.

### 2. Security & Auth
- **Auth Flow**: Transitioned from localStorage tokens to secure HttpOnly cookies (`jwt`).
- **RolesGuard**: Implemented a "default-deny" RolesGuard using a custom `@Roles()` decorator.
- **GetUser Decorator**: Added a custom decorator to retrieve typed user info from requests.
- **AllExceptionsFilter**: Hardened global error handling to prevent stack trace leaks in production.
- **AuditInterceptor**: Refactored to use strict typing and automatically log major entity changes.

### 3. Logic & Reliability
- **ShipmentService**: Refactored `createFromRequest` into an atomic transaction including resource locking and status updates.
- **Strict Typing**: Removed all `any` types from Entities, Services, and Controllers.
- **Circular References**: Added `@Exclude()` decorators to bidirectional relationship fields to prevent serialization loops.

---

## Frontend Refactors (client)

### 1. Architecture
- **Service Layer**: Centralized all API logic into dedicated service files (`auth.service.ts`, `request.service.ts`, `shipment.service.ts`, etc.).
- **Centralized Types**: Established a unified `types/index.ts` file to ensure consistency across the application.
- **Axios Configuration**: Configured global axios instance with `withCredentials: true` and standardized base URL.

### 2. Authentication & Authorization
- **AuthContext**: Rewritten to handle session restoration from cookies and provide granular role flags (`isAdmin`, `isLogistician`, `isClient`).
- **ProtectedRoute**: Implemented role-based route protection.
- **VerifyEmail / CompleteProfile**: Added missing flows for new user onboarding.

### 3. UI Components
- **React 19 / MUI v7 Fixes**: Replaced legacy Grid props with the modern `size` API to eliminate console warnings and layout issues.
- **ErrorBoundary**: Added a global ErrorBoundary and wrapped the main layout for high fault tolerance.
- **Refactored Dashboards**: Updated Admin, Client, and Logistician dashboards to use the new service layer and strict typing.

### 4. Logic Fixes
- **LTL Management**: Refactored consolidation logic to use service calls and handle status transitions correctly.
- **Shipment Tracking**: Refactored GPS polling and Map rendering with React 19 compatibility.
- **Create Request Form**: Standardized cargo types to match backend seed data exactly.
