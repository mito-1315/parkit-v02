# Smart Parking System — Comprehensive Project Handover Document

> **System Overview**: An end-to-end IoT-enabled Smart Parking Solution featuring automated slot allocation, camera/ANPR detection integration, real-time WebSocket monitoring, an Admin Web Console (React), and a User Mobile App (Flutter).

---

## 1. Project Architecture & Stack Overview

The workspace is organized as a multi-tier repository containing three major components:

```
v01/
├── openapi.yaml           # Source of Truth OpenAPI 3.0 API Specification
├── docker-compose.yml     # PostgreSQL + Redis local environment setup
├── backend/               # Node.js + TypeScript + Express + Prisma REST & Socket.IO Server
├── adminFrontend/         # Admin Web Console (React 19 + Vite + Zustand + TanStack Query + Tailwind v4)
└── App/                   # User-Facing Parker App (Flutter 3.x + Riverpod + Dio + GoRouter)
```

### Technology Matrix

| Layer | Core Technologies | Key Packages / Modules |
| :--- | :--- | :--- |
| **Backend API** | Node.js (v20+), Express, TypeScript | Prisma ORM, Socket.IO, Zod, JsonWebToken, Pino |
| **Database** | PostgreSQL (or SQLite for dev) | Prisma Migrate, Seed scripts |
| **Admin Console** | React 19, Vite, TypeScript | Zustand, TanStack Query v5, Socket.IO Client, Tailwind CSS v4, Lucide Icons, QR Code |
| **Parker App** | Flutter (Dart) | Flutter Riverpod, Dio, Socket.IO Client, GoRouter, Mobile Scanner, Shared Preferences |
| **Testing** | Jest (Backend), Vitest + MSW (Admin), Mocktail (Flutter) | Supertest, React Testing Library, Flutter Test |

---

## 2. Directory Structure & Key Files Map

### 2.1 Backend (`/backend`)
- `prisma/schema.prisma` — Database schema (User, Facility, Zone, Slot, Camera, Gate, ParkingSession, CameraSlotCoverage, Alert, AuditLog).
- `prisma/seed.ts` — Seeds default admin, test parkers, facility ("City Center Mall"), zones, slots, cameras, and gates.
- `src/server.ts` — HTTP server bootstrap & Socket.IO attachment.
- `src/app.ts` — Express application setup, CORS, JSON parsing, routes mounting, global error handler.
- `src/controllers/` — Route handlers for Auth, Allocation, Sessions, Facilities, Cameras, Gates, Alerts, Admin Users.
- `src/services/` — Business logic implementations:
  - `allocationService.ts`: Real-time slot allocation algorithm (zone scoring, distance, availability).
  - `cameraService.ts`: Handles camera detection inputs and resolves `CameraSlotCoverage` overlaps.
  - `sessionService.ts`: Parking session state transitions (`DETECTING` -> `RESERVED` -> `ACTIVE` -> `COMPLETED`).
- `src/sockets/` — Socket.IO namespace managers (`/dashboard` and `/alerts`).
- `src/middlewares/` — `authMiddleware.ts` (JWT verification & Role-Based Access Control: `ADMIN`, `OPERATOR`, `PARKER`).
- `tests/` — Integration test suite using Jest and Supertest.

### 2.2 Admin Console (`/adminFrontend`)
- `src/App.tsx` — Main application component with `QueryClientProvider` and `react-router-dom` routes.
- `src/store/authStore.ts` — In-memory Zustand store managing JWT token, user profile, and `activeFacilityId`.
- `src/api/` — Axios instance with auth interceptor (`client.ts`) and modular endpoint functions (`auth.ts`, `facilities.ts`, `cameras.ts`, `gates.ts`, `slots.ts`, `sessions.ts`, `alerts.ts`).
- `src/sockets/socketManager.ts` & `src/hooks/useSocketEvents.ts` — Real-time event listeners triggering TanStack query cache invalidation.
- `src/components/` — `Layout.tsx` (Sidebar + Topbar with facility selector), `ProtectedRoute.tsx`, `DevPanel.tsx` (real-time socket debugger overlay).
- `src/pages/` — `Login.tsx`, `LiveMonitoring.tsx` (Slot status grid), `Facilities.tsx`, `Cameras.tsx` (Conflict resolution UI), `Gates.tsx` (QR Code generator), `EntryExit.tsx` (Manual overrides), `Vehicles.tsx` (Plate search), `Alerts.tsx`, `Reports.tsx`.
- `src/index.css`, `postcss.config.js`, `tailwind.config.js` — Tailwind CSS v4 setup with `@tailwindcss/postcss`.
- `src/tests/` — Vitest + MSW component tests (`Login.test.tsx`, `LiveMonitoring.test.tsx`).

### 2.3 Parker App (`/App`)
- `pubspec.yaml` — Flutter dependencies.
- `lib/main.dart` — Application entry point, `SharedPreferences` initialization, and `ProviderScope`.
- `lib/router.dart` — `go_router` configuration with auth redirect guards.
- `lib/models/` — Dart data classes (`user.dart`, `vehicle.dart`, `parking_session.dart`, `slot.dart`, `facility.dart`).
- `lib/services/` — `api_client.dart` (Dio client with automatic JWT token refresh on 401), `socket_service.dart` (Socket.IO client for `/dashboard`).
- `lib/providers/` — Riverpod providers (`auth_provider.dart`, `vehicle_provider.dart`, `session_provider.dart`, `socket_provider.dart`).
- `lib/screens/` — `login_screen.dart`, `register_screen.dart`, `home_screen.dart`, `vehicles_screen.dart`, `scan_gate_screen.dart` (QR scanner), `slot_allocated_screen.dart`, `active_session_screen.dart` (Live elapsed timer + manual exit), `history_screen.dart`.
- `test/` — Unit and widget test suite using `mocktail` (`widget_test.dart`, `register_screen_test.dart`, `home_screen_test.dart`, `vehicles_screen_test.dart`, `scan_gate_screen_test.dart`, `slot_allocated_screen_test.dart`, `active_session_screen_test.dart`, `history_screen_test.dart`).

---

## 3. Database Schema & Data Models

Managed via Prisma (`backend/prisma/schema.prisma`).

```mermaid
erDiagram
    USER ||--o{ VEHICLE : owns
    USER ||--o{ PARKING_SESSION : creates
    FACILITY ||--o{ ZONE : contains
    FACILITY ||--o{ GATE : has
    FACILITY ||--o{ CAMERA : operates
    ZONE ||--o{ SLOT : contains
    SLOT ||--o{ CAMERA_SLOT_COVERAGE : covered_by
    CAMERA ||--o{ CAMERA_SLOT_COVERAGE : monitors
    SLOT ||--o{ PARKING_SESSION : allocated_to
    GATE ||--o{ PARKING_SESSION : entry_at
    GATE ||--o{ PARKING_SESSION : exit_at
```

### Core Entities
1. **User**: `id`, `email`, `password_hash`, `name`, `role` (`ADMIN`, `OPERATOR`, `PARKER`), `phone_number`.
2. **Facility**: `id`, `name`, `address`, `total_slots`.
3. **Zone**: `id`, `facility_id`, `name`, `floor`.
4. **Slot**: `id`, `zone_id`, `label`, `status` (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`, `DISABLED`), `slot_type` (`REGULAR`, `EV`, `HANDICAPPED`).
5. **Camera**: `id`, `facility_id`, `ip_address`, `location_desc`.
6. **CameraSlotCoverage**: `id`, `camera_id`, `slot_id`, `confidence_score`, `is_confirmed`. Resolves overlap when multiple cameras view the same slot.
7. **Gate**: `id`, `facility_id`, `name`, `type` (`ENTRY`, `EXIT`), `qr_code`.
8. **Vehicle**: `id`, `user_id`, `license_plate`, `vehicle_type`, `make`, `model`, `color`.
9. **ParkingSession**: `id`, `user_id`, `vehicle_id`, `slot_id`, `entry_gate_id`, `exit_gate_id`, `entry_time`, `exit_time`, `status` (`DETECTING`, `RESERVED`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
10. **Alert**: `id`, `facility_id`, `type`, `description`, `status` (`ACTIVE`, `RESOLVED`).

---

## 4. API & WebSocket Specifications

### 4.1 OpenAPI Endpoint Summary (`openapi.yaml`)
- `POST /auth/register` & `POST /auth/login`: User registration & authentication.
- `POST /auth/refresh`: Token rotation using refresh token.
- `POST /auth/admin/login`: Admin-specific login route.
- `GET /facilities` & `POST /facilities`: Facility management.
- `GET /facilities/{id}/zones`: Retrieve facility zones.
- `GET /zones/{id}/slots`: Retrieve zone slots.
- `GET /vehicles` & `POST /vehicles` & `DELETE /vehicles/{id}`: Vehicle management for parkers.
- `POST /allocation/allocate`: Triggers slot allocation logic (`{ licensePlate, entryGateId }`).
- `GET /sessions/active` & `GET /sessions/history`: Retrieve active or past parking sessions.
- `POST /sessions/{id}/confirm-entry`: Confirm vehicle arrival at entry gate.
- `POST /sessions/{id}/confirm-exit`: Confirm vehicle departure at exit gate (`{ exitGateId }`).
- `GET /cameras`, `GET /camera-slot-coverage`, `POST /camera-slot-coverage/{id}/confirm`: Camera conflict resolution.
- `GET /gates` & `POST /gates`: Gate management.
- `GET /alerts` & `POST /alerts/{id}/resolve`: Alert management.

### 4.2 WebSockets (`Socket.IO`)
- **Namespace `/dashboard`**:
  - `joinFacility(facilityId)`: Subscribes socket to room `facility_${facilityId}`.
  - Events emitted: `slot_update` (`{ slotId, status }`), `session_update` (`{ sessionId, status }`).
- **Namespace `/alerts`**:
  - `joinFacility(facilityId)`: Subscribes socket to room `facility_${facilityId}`.
  - Events emitted: `new_alert` (`{ alertId, type, description }`).

---

## 5. Configuration & Environment Variables

Create `.env` in `backend/` based on `.env.example`:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_parking?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

---

## 6. How to Run the Applications

### 6.1 Backend (`/backend`)
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
# Server running at http://localhost:4000
```

### 6.2 Admin Console (`/adminFrontend`)
```bash
cd adminFrontend
npm install
npm run dev
# React Web Console running at http://localhost:5173
```

### 6.3 Parker App (`/App`)
```bash
cd App
flutter pub get
flutter run -d chrome # or android / ios
```

---

## 7. Running Test Suites

### Backend Integration Tests (Jest)
```bash
cd backend
npm test
```

### Admin Frontend Component Tests (Vitest + MSW)
```bash
cd adminFrontend
npm run test
```

### Parker App Widget Tests (Flutter + Mocktail)
```bash
cd App
flutter test
```

---

## 8. Development Credentials & Seed Data

Default seed script populates the database with:
- **Admin User**: `admin@smartpark.com` / `password123`
- **Parker User**: `parker@test.com` / `password123`
- **Facility**: `City Center Mall` (ID: `1`)
- **Gates**: `Entry Gate 1` (ID: `1`, Type: `ENTRY`), `Exit Gate 1` (ID: `2`, Type: `EXIT`)
- **Vehicles**: `TN01AB1234` (Car) registered to `parker@test.com`

---

## 9. Context & Guidelines for AI Agents (Cursor / Claude / Copilot)

When working on this repository in future AI sessions:
1. **Source of Truth**: Always respect `openapi.yaml` for API parameters, paths, and payload formats.
2. **State Scoping**:
   - The React Admin App uses Zustand in-memory state for auth (`authStore.ts`). Sockets are joined based on `activeFacilityId`.
   - The Flutter Parker App uses Riverpod (`auth_provider`, `session_provider`, `vehicle_provider`) and Dio interceptors for token refreshes.
3. **Styling Rules**:
   - Admin Frontend uses Tailwind CSS v4 with `@tailwindcss/postcss`. Use `@import "tailwindcss";` in `src/index.css`.
   - Parker App uses custom Flutter widgets in `lib/widgets/` with custom dark theme colors (`#0A0A0F` background, `#6366F1` indigo accents).
4. **WebSocket Convention**: Always ensure socket events broadcast to `facility_${facilityId}` room so multi-facility dashboards isolate their event channels.
