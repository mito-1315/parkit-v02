# Parkit — Full Technical Document
### Smart Parking Management System

> **Version**: 1.0 | **Date**: August 2026 | **Status**: Active Development

---

## Table of Contents

1. [Project Overview (Non-Technical)](#1-project-overview-non-technical)
2. [User Flow — How Parkit Works](#2-user-flow--how-parkit-works)
   - 2.1 [Facility Operator Flow](#21-facility-operator-flow)
   - 2.2 [Parker (Driver) Flow](#22-parker-driver-flow)
3. [System Architecture](#3-system-architecture)
4. [Repository Structure](#4-repository-structure)
5. [Database Design](#5-database-design)
6. [Backend — API & Services](#6-backend--api--services)
7. [Admin Console (Web)](#7-admin-console-web)
8. [Parkit Mobile App (Flutter)](#8-parkit-mobile-app-flutter)
9. [Real-Time Communication](#9-real-time-communication)
10. [Onboarding Wizard](#10-onboarding-wizard)
11. [Fee Calculation](#11-fee-calculation)
12. [AI Integration — Current State & Roadmap](#12-ai-integration--current-state--roadmap)
13. [Security & Authentication](#13-security--authentication)
14. [Environment Setup & Running Locally](#14-environment-setup--running-locally)
15. [Testing Strategy](#15-testing-strategy)
16. [Key Design Decisions & Constraints](#16-key-design-decisions--constraints)

---

## 1. Project Overview (Non-Technical)

### What is Parkit?

Parkit is a **smart parking management system** built for parking facilities such as shopping malls, office complexes, hospitals, and airports. It solves three persistent problems in traditional parking:

| Problem | Traditional Parking | With Parkit |
|---|---|---|
| Finding a free slot | Drive around until you spot one | App shows exactly which slot is available before you enter |
| Entry / exit delays | Manual ticket + barrier = queue | Scan a QR code → barrier lifts automatically |
| Revenue tracking | Paper logs, manual reconciliation | Every session is digitally recorded with auto-calculated fees |

### Who uses it?

There are two distinct types of users:

**1. Facility Operators / Admins**
A parking facility manager who uses the **Admin Web Console** (accessed from any browser) to:
- Set up their facility once using a guided onboarding wizard
- Watch a live map of every parking slot in real time (green = free, orange = reserved, red = occupied)
- View entry/exit logs and generate revenue reports
- Receive alerts (e.g. camera offline, parking lot full)
- Print QR codes for entry and exit gates

**2. Parkers (Drivers)**
A person with the **Parkit mobile app** on their Android (or iOS) phone who:
- Registers once with name, email, and vehicle plate number
- Scans the QR code at a facility's entry gate to start a session
- Gets directed to their assigned parking slot
- Confirms when they are parked
- Scans the exit gate QR when leaving — the app shows the fee owed

### What makes it "smart"?

The system is designed to be **camera-aware**. Cameras installed inside the parking facility monitor individual parking slots and feed data into the system. In the current version, this AI detection layer is **mocked/simulated** (no live model runs), but the architecture is fully built and ready to plug in a real computer vision model. The complete roadmap for this is described in [Section 12](#12-ai-integration--current-state--roadmap).

---

## 2. User Flow — How Parkit Works

### 2.1 Facility Operator Flow

#### Step 0 — First-Time Setup (Onboarding Wizard)

When a new facility admin logs in for the first time, they are guided through an **8-step onboarding wizard** before the system goes live. This is a one-time process.

```
Step 1 — Facility Details
  Enter name, address, city, contact phone/email.

Step 2 — Zones
  Define floors/areas (e.g. "Ground Floor", "First Floor", "Basement").
  Each zone maps to a physical area of the car park.

Step 3 — Cameras
  Register each camera by name and type:
    • PARKING_SLOT_CAM — overlooks parking bays (used for slot detection)
    • ANPR             — reads number plates at gates
  Assign each camera to a zone.

Step 4 — Capture Empty Lot Image
  For each parking slot camera, record the "reference image"
  (what the camera sees when all slots are empty).
  This is the baseline used by the AI later.

Step 5 — Extract Parking Boxes (AI)
  The system analyses the empty lot image and identifies
  the bounding box of every individual parking slot.
  → Currently: simulated/mocked
  → Future: real computer vision model

Step 6 — Review Detections
  The operator reviews the detected slots.
  Duplicates (same slot seen by two cameras) are flagged
  and resolved manually — one is kept, one is discarded.
  Each confirmed slot becomes a ParkingSlot record in the database.

Step 7 — Configure Gates
  Assign ANPR cameras to entry/exit gates.
  Each gate gets a unique QR code the operator can print.

Step 8 — Set Pricing
  Define hourly rate, currency, minimum fee, and grace period.
  Review summary and click "Complete Onboarding".
```

After onboarding, the facility is live.

#### Day-to-Day Admin Operations

```
Live Monitoring Dashboard
  Real-time grid showing every slot:
  ■ Green  = AVAILABLE
  ■ Orange = RESERVED (vehicle approaching)
  ■ Red    = OCCUPIED (vehicle parked)
  ■ Grey   = MAINTENANCE / DISABLED

Entry & Exit Log
  List of all parking sessions with entry time,
  exit time, vehicle plate, duration, and fee.

Alerts Panel
  System alerts (camera offline, lot full, etc.)
  Admin can acknowledge/resolve each alert.

Reports
  Revenue summary, occupancy rate, peak hours.

Gates & QR Codes
  Print or regenerate QR codes for each entry/exit gate.
  Entry gates and exit gates are shown in separate sections.
```

---

### 2.2 Parker (Driver) Flow

#### First-Time Setup

```
1. Download "Parkit" app from the Play Store / App Store.
2. Register: name, email, password.
3. Add your vehicle: license plate, make, model, colour.
   (Multiple vehicles are supported.)
```

#### Every Parking Visit

```
ENTRY FLOW
─────────────────────────────────────────────────────────

  [Arrival at facility]
        │
        ▼
  Open Parkit app → Tap "Scan Gate QR"
        │
        ▼
  Point camera at the QR code on the ENTRY gate
        │
        ▼
  App reads QR → sends to backend
  Backend uses ANPR camera at that gate to detect plate
        │
        ▼
  "Confirm Vehicle" screen
  Shows detected plate number (editable if wrong)
        │
        ▼
  Tap "Confirm — this is my vehicle"
  Backend allocates the best available slot
        │
        ▼
  "Slot Assigned" screen
  Shows slot label (e.g. A-12), floor, zone
        │
        ▼
  Driver navigates to the assigned slot
        │
        ▼
  Tap "Confirm Parked"
  → Session status: RESERVED → ACTIVE
  → Slot status: RESERVED → OCCUPIED
  → Timer starts in admin dashboard
        │
        ▼
  "Active Session" screen
  Shows live elapsed time, slot info, vehicle info


EXIT FLOW
─────────────────────────────────────────────────────────

  [Ready to leave]
        │
        ▼
  Tap "Scan Exit Gate" in app
  Point camera at EXIT gate QR code
        │
        ▼
  Backend calculates fee (hourly rate × duration)
        │
        ▼
  "Session Complete" screen
  Shows: total duration, fee owed, payment status
  Slot is freed → AVAILABLE in admin dashboard
        │
        ▼
  Pay at counter (payment integration: future phase)
```

#### App Screen Map

```
Login / Register
    └── Home Screen
          ├── (Active session card)  ──► Active Session Screen
          │                                   └── Scan Exit Gate ──► Amount Due
          ├── Scan Gate QR ──► Confirm Vehicle ──► Slot Assigned ──► Active Session
          ├── My Vehicles  ──► Add / Delete vehicles
          ├── History      ──► Past sessions list
          └── Profile      ──► Update name, phone
```

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                │
│                                                                 │
│  ┌─────────────────────────┐   ┌──────────────────────────┐    │
│  │  Admin Web Console       │   │  Parkit Mobile App        │    │
│  │  React 19 + Vite         │   │  Flutter 3.x (Android)    │    │
│  │  Zustand + TanStack Q    │   │  Riverpod + Dio           │    │
│  │  Tailwind CSS v4         │   │  GoRouter                 │    │
│  └───────────┬─────────────┘   └──────────┬───────────────┘    │
│              │  HTTP/REST + Socket.IO       │  HTTP/REST          │
└──────────────┼─────────────────────────────┼────────────────────┘
               │                             │
               ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                             │
│                                                                 │
│   Node.js 20 + Express + TypeScript                            │
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│   │  REST API │  │ Socket.IO│  │  Zod     │  │  Pino Log   │  │
│   │  Routes   │  │ /dash    │  │ Validate │  │             │  │
│   │  + JWT    │  │ /alerts  │  │          │  │             │  │
│   └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
│                                                                 │
│   ┌──────────────────── Services ─────────────────────────┐    │
│   │  authService  │ allocationEngine │  sessionService     │    │
│   │  gateScanSvc  │ onboardingService│  feeCalculator      │    │
│   │  facilityService │ zoneService   │  cameraService      │    │
│   │  alertService │ reportService    │  backgroundJobs     │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
│   ┌──────────────── Prisma ORM ───────────────────────────┐    │
│   └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│               PostgreSQL Database                               │
│  (Schema managed by Prisma Migrate)                            │
└─────────────────────────────────────────────────────────────────┘
               │ (Future)
               ▼
┌─────────────────────────────────────────────────────────────────┐
│               AI / ML Services (Planned)                        │
│  • Slot occupancy detection (computer vision)                  │
│  • ANPR — Automatic Number Plate Recognition                   │
└─────────────────────────────────────────────────────────────────┘
```

### Communication Patterns

| Channel | Used For | Protocol |
|---|---|---|
| Admin ↔ Backend | CRUD operations, queries | HTTPS REST |
| App ↔ Backend | Session management, allocation | HTTPS REST |
| Backend → Admin | Live slot & session updates | Socket.IO (WebSocket) |
| Backend → App | Session state push (future) | Socket.IO (WebSocket) |

---

## 4. Repository Structure

```
v01/
├── openapi.yaml                  ← API specification (source of truth)
├── docker-compose.yml            ← PostgreSQL + Redis local setup
├── HANDOVER_DOCUMENT.md
├── FULL_TECHNICAL_DOCUMENT.md    ← this file
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         ← Database schema
│   │   ├── seed.ts               ← Seed script (admin, parker, facility, gates)
│   │   └── migrations/           ← Migration history
│   ├── src/
│   │   ├── app.ts                ← Express app setup, CORS, route mounting
│   │   ├── server.ts             ← HTTP server + Socket.IO attachment
│   │   ├── config/               ← Constants, JWT config
│   │   ├── controllers/          ← Route handlers (thin layer, calls services)
│   │   ├── services/             ← All business logic
│   │   ├── routes/               ← Express router definitions
│   │   ├── middleware/           ← Auth (JWT + RBAC), error handler
│   │   ├── sockets/              ← Socket.IO namespace managers
│   │   ├── ai-mock/              ← Mock AI adapter (aiAdapter.interface.ts, mockAiAdapter.ts)
│   │   ├── database/             ← Prisma client singleton
│   │   ├── utils/                ← parseId, sessionInclude helpers
│   │   └── validations/          ← Zod schemas for request validation
│   └── tests/
│       ├── e2e/                  ← End-to-end onboarding + session tests
│       └── unit/                 ← Fee calculator, allocation engine unit tests
│
├── adminFrontend/
│   ├── src/
│   │   ├── api/                  ← Axios-based endpoint functions per domain
│   │   ├── components/           ← Layout, ProtectedRoute, UI primitives
│   │   ├── hooks/                ← useSocketEvents, custom hooks
│   │   ├── pages/                ← One file per page/feature
│   │   ├── store/                ← Zustand auth store
│   │   ├── sockets/              ← Socket.IO client manager
│   │   └── lib/                  ← ID normalisation helpers
│   └── src/tests/                ← Vitest + MSW component tests
│
└── App/
    ├── lib/
    │   ├── main.dart             ← Entry point, SharedPreferences init
    │   ├── theme.dart            ← Parkit design tokens (Pk class)
    │   ├── router.dart           ← GoRouter with auth guards
    │   ├── models/               ← Dart data classes (JSON serialisable)
    │   ├── providers/            ← Riverpod state providers
    │   ├── screens/              ← One file per screen
    │   ├── services/             ← ApiClient (Dio), SocketService
    │   ├── widgets/              ← Reusable widgets (GradientButton → PkButton, etc.)
    │   └── mocks/                ← MockApiClient for UI development without backend
    └── test/                     ← Flutter widget and unit tests
```

---

## 5. Database Design

All tables are managed by **Prisma** with migrations tracked under `backend/prisma/migrations/`.

### Entity Relationship Diagram

```
FACILITY ──< ZONE ──< PARKING_SLOT
    │                     │
    │                     └── PRIMARY_CAMERA (FK → Camera)
    │
    ├──< CAMERA
    │        └── RAW_SLOT_DETECTION (onboarding: extracted slot bounding boxes)
    │
    ├──< GATE ─────< PARKING_SESSION (entry_gate, exit_gate)
    │
    ├──< ADMIN_USER
    │
    └──< PARKING_SESSION ──< VEHICLE ──< USER
              └──< ALERT
```

### Tables & Key Fields

#### `Facility`
| Column | Type | Notes |
|---|---|---|
| `facility_id` | INT PK | |
| `name`, `address`, `city` | STRING | |
| `hourly_rate` | DECIMAL(10,2) | Used in fee calculation |
| `currency` | STRING | Default: `INR` |
| `grace_period_minutes` | INT | Free time before billing starts |
| `minimum_fee` | DECIMAL(10,2) | Floor fee even for short stays |
| `onboarding_status` | ENUM | `NOT_STARTED` / `IN_PROGRESS` / `COMPLETED` |
| `onboarding_step` | INT | 1–8, tracks wizard progress |

#### `Zone`
| Column | Type | Notes |
|---|---|---|
| `zone_id` | INT PK | |
| `facility_id` | INT FK | |
| `name` | STRING | e.g. "Ground Floor", "Basement" |
| `floor_level` | INT | 0 = ground, 1 = first floor, -1 = basement |

#### `ParkingSlot`
| Column | Type | Notes |
|---|---|---|
| `slot_id` | INT PK | |
| `slot_code` | STRING | Human-readable (e.g. "A-12") |
| `slot_type` | ENUM | `NORMAL`, `EV`, `ACCESSIBLE`, `VIP`, `TWO_WHEELER`, `HEAVY` |
| `status` | ENUM | `AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`, `BLOCKED`, `UNKNOWN` |
| `primary_camera_id` | INT FK? | Which camera monitors this slot |
| `distance_from_gate` | FLOAT? | Used in allocation scoring |

#### `Camera`
| Column | Type | Notes |
|---|---|---|
| `camera_id` | INT PK | |
| `camera_type` | ENUM | `PARKING_SLOT_CAM`, `ANPR`, `GATE_ENTRY_CAM`, `GATE_EXIT_CAM` |
| `zone_id` | INT FK? | Which zone this camera monitors |
| `empty_lot_image_url` | STRING? | Reference image captured during onboarding |

#### `RawSlotDetection`
Stores unreviewed AI detections from the onboarding extraction step.
| Column | Type | Notes |
|---|---|---|
| `detection_id` | INT PK | |
| `camera_id` | INT FK | Which camera produced this detection |
| `suggested_code` | STRING | AI-suggested slot label |
| `bounding_box` | JSON | `{x, y, width, height}` in image coordinates |
| `confidence` | FLOAT | 0.0–1.0 |
| `status` | ENUM | `PENDING_REVIEW`, `CONFIRMED`, `REJECTED`, `DUPLICATE_REMOVED` |
| `duplicate_of_id` | INT FK? | Points to the "kept" detection if this is a duplicate |
| `promoted_slot_id` | INT FK? | The `ParkingSlot` created from this detection |

#### `Gate`
| Column | Type | Notes |
|---|---|---|
| `gate_id` | INT PK | |
| `gate_type` | ENUM | `ENTRY`, `EXIT`, `BOTH` |
| `qr_code` | STRING UNIQUE | Encoded payload: `{"gateId": N, "type": "ENTRY"}` |
| `camera_id` | INT FK UNIQUE | Associated ANPR camera |

#### `ParkingSession`
| Column | Type | Notes |
|---|---|---|
| `session_id` | INT PK | |
| `status` | ENUM | `RESERVED` → `ACTIVE` → `COMPLETED` / `CANCELLED` |
| `entry_time` | DATETIME? | Set when `confirmEntry` is called |
| `exit_time` | DATETIME? | Set when `confirmExit` is called |
| `duration_minutes` | INT? | Calculated on exit |
| `parking_fee` | DECIMAL? | Calculated on exit using fee formula |
| `payment_status` | ENUM | `NOT_APPLICABLE`, `PENDING`, `PAID` |

#### `Alert`
| Column | Type | Notes |
|---|---|---|
| `alert_type` | ENUM | `PARKING_FULL`, `CAMERA_OFFLINE`, `SLOT_CONFLICT`, etc. |
| `severity` | ENUM | `INFO`, `WARNING`, `CRITICAL` |
| `is_resolved` | BOOL | Toggled by admin from the Alerts panel |

---

## 6. Backend — API & Services

### 6.1 Technology Stack

| Component | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Language | TypeScript (strict) |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Validation | Zod |
| Authentication | JSON Web Tokens (access + refresh) |
| Real-time | Socket.IO 4 |
| Logging | Pino |
| Testing | Jest + Supertest |

### 6.2 Middleware Stack

Every incoming request passes through:

```
Request
  → CORS (allows admin frontend + app origins)
  → express.json() body parser
  → Route matching
      → authMiddleware (JWT verification, attaches req.user)
      → RBAC check (role: ADMIN / OPERATOR / PARKER)
      → Zod validation (schema.parse(req.body))
      → Controller
          → Service
              → Prisma
  → Error handler (catches AppError, formats JSON response)
```

### 6.3 Service Layer

Each service is a static class with pure async methods.

#### `authService.ts`
- `register(dto)` — hashes password (bcrypt), creates User, returns tokens
- `login(email, password)` — verifies credentials, returns JWT pair
- `refreshTokens(refreshToken)` — validates refresh token, rotates both tokens

#### `allocationEngine.ts`
Allocates the best available parking slot for a vehicle.

```
Algorithm:
1. Fetch all AVAILABLE slots for the facility
2. Score each slot:
   score = (1 / distance_from_gate) * zone_weight
3. Select slot with highest score
4. Atomically:
   a. Set slot.status = RESERVED
   b. Create ParkingSession (status: RESERVED)
5. Return session
```

#### `sessionService.ts`
Manages the lifecycle of a ParkingSession.

```
confirmEntry(sessionId):
  • Validates session.status == RESERVED
  • Sets status → ACTIVE, sets entry_time = NOW()
  • Sets slot.status = OCCUPIED
  • Emits socket events: session:updated, slot:statusChanged

confirmExit(sessionId, exitGateId):
  • Validates session.status == ACTIVE
  • Calls feeCalculator.calculateParkingFee()
  • Sets status → COMPLETED, exit_time, duration_minutes, parking_fee
  • Sets slot.status = AVAILABLE
  • Emits socket events
```

#### `feeCalculator.ts`

```typescript
calculateParkingFee(
  entryTime: Date,
  exitTime: Date,
  hourlyRate: number,
  gracePeriodMinutes: number,
  minimumFee: number
): number

Formula:
  billable_minutes = max(0, duration_minutes - grace_period_minutes)
  raw_fee = (billable_minutes / 60) * hourly_rate
  fee = max(minimum_fee, raw_fee)
  return round(fee, 2)
```

#### `gateScanService.ts`
Handles the mobile app's gate scanning flow.

```
scanEntry(gateId):
  1. Validate gate exists and is ENTRY type
  2. Call AI adapter: detectPlateAtGate(gateId)
     → returns { licensePlate, confidence }
  3. Return detection result to app

confirmEntry(gateId, licensePlate, userId):
  1. Validate gate is ENTRY type
  2. Call AllocationEngine.allocateSlot(licensePlate, gateId, userId)
  3. Return new ParkingSession

scanExit(gateId, { sessionId, userId }):
  1. Validate gate is EXIT type
  2. Call AI adapter for plate detection
  3. Find active session (by sessionId or by user)
  4. Call SessionService.confirmExit()
  5. Return completed session with fee
```

#### `onboardingService.ts`
Orchestrates the 8-step facility setup wizard.

```
Steps and their service methods:
  1. createFacilityAndAdmin(dto)    → Creates Facility + AdminUser
  2. createZones(facilityId, dto)  → Creates Zone records
  3. createCameras(facilityId, dto)→ Creates Camera records
  4. captureEmptyLot(cameraId)     → Stores reference image URL
  5. extractBoxes(cameraId)        → Calls AI mock → creates RawSlotDetections
  6. getRawDetections / rejectDetection / markDuplicate / confirmDetection
                                   → Review workflow, creates ParkingSlot on confirm
  7. createGates(facilityId, dto)  → Idempotent: deletes + recreates gates
  8. setPricing(facilityId, dto)   → Updates hourly_rate, currency, etc.
     complete(facilityId)          → Validates everything, sets onboarding_status = COMPLETED
```

#### `alertService.ts`
- Creates alerts (triggered by background jobs or camera events)
- `resolveAlert(alertId, adminId)` — marks as resolved

#### `backgroundJobs.ts`
Runs periodic maintenance:
- Marks sessions as `EXPIRED` if `RESERVED` for > 30 minutes without confirmation
- Marks cameras as `OFFLINE` if heartbeat not received in > 5 minutes
- Triggers `PARKING_FULL` alert when occupancy > 95%

### 6.4 REST API Reference

All endpoints are prefixed with `/api/v1`.

#### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Register parker account |
| POST | `/auth/login` | None | Parker login |
| POST | `/auth/refresh` | None | Rotate JWT tokens |
| POST | `/auth/admin/login` | None | Admin login |

#### Onboarding
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/onboarding/status` | Admin | Get current onboarding status |
| POST | `/onboarding/facility` | None | Step 1: Create facility + admin |
| POST | `/onboarding/:id/zones` | Admin | Step 2: Create zones |
| POST | `/onboarding/:id/cameras` | Admin | Step 3: Add cameras |
| POST | `/onboarding/:id/capture-empty-lot` | Admin | Step 4: Record empty lot |
| POST | `/onboarding/:id/extract-boxes` | Admin | Step 5: AI slot extraction |
| GET | `/onboarding/:id/raw-detections` | Admin | Step 6: Get pending detections |
| PATCH | `/onboarding/detections/:dId/confirm` | Admin | Confirm a detection |
| PATCH | `/onboarding/detections/:dId/reject` | Admin | Reject a detection |
| PATCH | `/onboarding/detections/:dId/duplicate` | Admin | Mark as duplicate |
| POST | `/onboarding/:id/gates` | Admin | Step 7: Create gates |
| POST | `/onboarding/:id/pricing` | Admin | Step 8: Set pricing |
| POST | `/onboarding/:id/complete` | Admin | Finalise onboarding |
| POST | `/onboarding/realign-slot-zones` | Admin | Fix slot zone misalignments |

#### Gate Scanning (Mobile App)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/gates/:id/scan-entry` | Parker | Detect plate at entry gate |
| POST | `/gates/:id/confirm-entry` | Parker | Allocate slot + create session |
| POST | `/gates/:id/scan-exit` | Parker | End session + calculate fee |

#### Sessions
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/sessions/active` | Parker | Get current active session |
| GET | `/sessions/history` | Parker | Get completed sessions |
| POST | `/sessions/:id/confirm-entry` | Parker | Manual confirm parked |
| POST | `/sessions/:id/confirm-exit` | Parker | Manual confirm exit |

#### Facilities, Zones, Slots, Cameras, Gates
Standard CRUD for admin use. All scoped to `facility_id`.

---

## 7. Admin Console (Web)

### 7.1 Technology Stack

| Component | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite |
| State (server) | TanStack Query v5 |
| State (client) | Zustand |
| Styling | Tailwind CSS v4 |
| HTTP | Axios |
| Real-time | Socket.IO Client |
| Icons | Lucide React |
| QR Codes | qrcode.react |
| Testing | Vitest + MSW + React Testing Library |

### 7.2 Application State

**TanStack Query** handles all server-derived state (facility list, slot statuses, sessions, alerts). Queries are invalidated when:
- A mutation succeeds (optimistic or on-success)
- A Socket.IO event arrives (`slot:statusChanged`, `session:updated`, `new_alert`)

**Zustand** (`authStore.ts`) holds only two things:
- The authenticated admin's JWT token and profile
- `activeFacilityId` — which facility's data is currently displayed

### 7.3 Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | Admin authentication |
| Landing | `/` | Checks onboarding status, redirects accordingly |
| Onboarding Wizard | `/onboarding` | 8-step facility setup |
| Live Monitoring | `/monitoring` | Real-time slot grid |
| Configuration | `/configuration` | Manage facility, zones, slots, cameras, gates |
| Entry & Exit | `/entry-exit` | Manual session overrides |
| Vehicles | `/vehicles` | Search by plate number |
| Alerts | `/alerts` | Active and resolved alerts |
| Reports | `/reports` | Revenue and occupancy summaries |
| Gates & QR Codes | `/gates` | Print entry/exit QR codes |

### 7.4 Real-Time Updates

The admin console connects to the backend's Socket.IO `/dashboard` namespace immediately after login:

```typescript
// socketManager.ts
socket.emit('joinFacility', activeFacilityId);

// Events received:
socket.on('slot:statusChanged', (slot) => {
  queryClient.invalidateQueries(['slots']);
});
socket.on('session:updated', (session) => {
  queryClient.invalidateQueries(['sessions']);
});
```

The slot grid in Live Monitoring updates within ~100ms of a slot status change triggered by the mobile app.

### 7.5 Onboarding Wizard (Frontend)

The wizard (`OnboardingWizard.tsx`) is a stateful React component managing all 8 steps. Key behaviours:
- **Back navigation**: Completed step badges (steps 2+) are clickable to go back and edit
- **Idempotency**: Going back to Gates and re-submitting deletes and recreates gates cleanly
- **Zone awareness**: When confirming slot detections in Step 6, the slot's zone defaults to the zone assigned to the detecting camera (not always zone 1)
- **ANPR warning**: If no ANPR camera exists when reaching the Gates step, a warning banner is shown and the form defaults to adding an ANPR camera

---

## 8. Parkit Mobile App (Flutter)

### 8.1 Technology Stack

| Component | Technology |
|---|---|
| Language | Dart |
| Framework | Flutter 3.x |
| State management | Flutter Riverpod 2.x |
| HTTP client | Dio (with JWT interceptor) |
| Navigation | GoRouter |
| QR scanning | mobile_scanner |
| Local storage | shared_preferences |
| Real-time | socket_io_client |

### 8.2 Design System

The app uses a central `theme.dart` file exposing the `Pk` class with all design tokens:

```dart
class Pk {
  static const bg       = Color(0xFF0D0D0D); // near-black background
  static const surface  = Color(0xFF181818); // card surface
  static const surface2 = Color(0xFF222222); // input fill
  static const border   = Color(0xFF2C2C2C); // subtle borders
  static const primary  = Color(0xFF2563EB); // solid blue accent
  static const success  = Color(0xFF16A34A); // green for active states
  static const danger   = Color(0xFFDC2626); // red for errors
  // Text colours, radius constants (r4, r6, r8, r10), etc.
}
```

Design philosophy: **flat, professional, minimal rounded corners** — no gradients, 6–8px border radius throughout.

### 8.3 State Architecture (Riverpod)

```
authProvider (StateNotifier<AsyncValue<User?>>)
  └── Controls authentication state
  └── Holds JWT tokens via SharedPreferences
  └── Exposes: login(), register(), logout(), restore(), updateProfile()

activeSessionProvider (StateNotifier<AsyncValue<ParkingSession?>>)
  └── Holds current active/reserved session
  └── Polls backend every 3s while session is DETECTING
  └── Subscribes to Socket.IO for push updates
  └── Exposes: scanEntry(), confirmEntry(), confirmParked(), scanExit(), confirmExit()

vehicleNotifierProvider (StateNotifier<AsyncValue<List<Vehicle>>>)
  └── List of user's vehicles
  └── Exposes: addVehicle(), removeVehicle()

sessionHistoryProvider (FutureProvider<List<ParkingSession>>)
  └── Completed sessions, sorted by date descending

lastCompletedSessionProvider (StateProvider<ParkingSession?>)
  └── Holds the just-completed session for the Amount Due screen

pendingEntryProvider (StateProvider<PlateDetection?>)
  └── Holds plate detection result between ScanGate and ConfirmVehicle screens
```

### 8.4 API Client (Dio)

`api_client.dart` wraps all HTTP calls with:
- **Base URL**: configurable (`http://<server-ip>:4000/api/v1`)
- **JWT interceptor**: attaches `Authorization: Bearer <token>` to every request
- **Refresh interceptor**: on 401, automatically calls `/auth/refresh` and retries the original request
- **Error wrapping**: HTTP errors are converted to `ApiException(message, statusCode)`

#### Key Methods

```dart
// Auth
Future<AuthResponse> login(email, password)
Future<AuthResponse> register(name, email, password, phone?)

// Gate scanning
Future<PlateDetection> scanEntry({gateId, forcePlate?})
Future<ParkingSession> confirmEntry({gateId, licensePlate})
Future<ParkingSession> confirmParked(sessionId)
Future<ParkingSession> scanExit({gateId, sessionId?})
Future<ParkingSession> confirmExit(sessionId, exitGateId)

// Sessions
Future<ParkingSession?> getActiveSession()
Future<List<ParkingSession>> getSessionHistory()

// Vehicles
Future<List<Vehicle>> getVehicles()
Future<Vehicle> addVehicle(licensePlate, type, make?, model?, color?)
Future<void> removeVehicle(vehicleId)
```

### 8.5 Navigation (GoRouter)

```
/login           → LoginScreen
/register        → RegisterScreen
/home            → HomeScreen           [auth required]
/scan-gate       → ScanGateScreen(isExit: false)
/scan-exit       → ScanExitScreen
/confirm-vehicle → ConfirmVehicleScreen
/slot-allocated  → SlotAllocatedScreen
/active-session  → ActiveSessionScreen
/amount-due      → AmountDueScreen
/vehicles        → VehiclesScreen
/history         → HistoryScreen
/profile         → ProfileScreen
```

Auth guard: If `authProvider.value == null`, all protected routes redirect to `/login`.

### 8.6 Gate QR Validation

Both scan screens enforce gate-type matching at two levels:

**Level 1 — Client (app)**:
```
ScanGateScreen (entry):
  Parse QR → read "type" field
  If type == "EXIT" → show error: "This is an exit gate QR. Please scan an ENTRY gate."

ScanExitScreen:
  Parse QR → read "type" field  
  If type == "ENTRY" → show error: "This is an entry gate QR. Please scan an EXIT gate."
```

**Level 2 — Server (backend)**:
```
GateScanService.scanEntry(): gate.gate_type !== 'ENTRY' → 400 WRONG_GATE_TYPE
GateScanService.scanExit():  gate.gate_type !== 'EXIT'  → 400 WRONG_GATE_TYPE
```

QR payload format (since v1.0): `{"gateId": <id>, "type": "ENTRY"|"EXIT"}`

---

## 9. Real-Time Communication

### Socket.IO Namespaces

#### `/dashboard` — Admin Real-Time Feed

```
Admin connects → emits: joinFacility(facilityId)
Backend adds socket to room: "facility_<id>"

Events broadcast by backend to this room:
  slot:statusChanged  → { slot_id, status, last_status_updated_at, ... }
  session:updated     → { session_id, status, slot_id, vehicle_id, ... }
  new_alert           → { alert_id, alert_type, severity, message }
```

These events are triggered in `sessionService.ts` after every state change (entry confirmation, exit confirmation) and in `alertService.ts` when an alert is created or resolved.

#### `/app` — Parker App Feed (future)

Currently the app polls via REST. A full push architecture over Socket.IO is planned for the next phase.

### Event Flow Example — "Confirm Parked"

```
[Phone]                    [Backend]                   [Admin Browser]
  │                            │                              │
  │── POST /sessions/:id/      │                              │
  │   confirm-entry ──────────►│                              │
  │                            │ UPDATE session SET           │
  │                            │   status='ACTIVE'            │
  │                            │   entry_time=NOW()           │
  │                            │ UPDATE slot SET              │
  │                            │   status='OCCUPIED'          │
  │                            │                              │
  │                            │── emit('session:updated') ──►│
  │                            │── emit('slot:statusChanged')►│
  │◄── 200 { session } ───────│                              │
  │                            │                   slot turns RED in UI
```

---

## 10. Onboarding Wizard

The onboarding wizard is the facility's one-time setup process. It cannot be skipped. Until `onboarding_status == COMPLETED`, the admin console shows the wizard instead of the live dashboard.

### Step Details

```
Step 1 — Facility & Admin
  Input: facility name, address, city, state, country, pincode,
         contact phone/email, admin name/email/password
  Creates: Facility record, AdminUser record
  Sets: onboarding_step = 1

Step 2 — Zones
  Input: array of { name, floor_level }
  Creates: Zone records
  Idempotency: if zones already exist, shows them read-only with "Continue"

Step 3 — Cameras
  Input: array of { name, camera_type, zone_id, stream_url? }
  Creates: Camera records
  Note: At least one ANPR camera required for gate assignment in Step 7.
        If none exist, wizard shows orange warning banner.

Step 4 — Capture Empty Lot
  For each PARKING_SLOT_CAM camera:
    Record empty_lot_image_url (simulated in current version)

Step 5 — Extract Parking Boxes
  For each camera with an empty lot image:
    POST /onboarding/:id/extract-boxes?cameraId=X
    Backend calls AI adapter → returns array of { suggested_code, bounding_box, confidence }
    Creates RawSlotDetection records (status: PENDING_REVIEW)

Step 6 — Review Detections
  Operator sees a list of detected bounding boxes.
  For each detection:
    → Confirm: creates ParkingSlot, sets detection status = CONFIRMED
    → Reject: sets detection status = REJECTED
    → Mark Duplicate: points to another detection, sets DUPLICATE_REMOVED
  Zone assignment: slot's zone = camera's zone_id (fixed in current version)

Step 7 — Configure Gates
  Input: array of { name, gate_type, camera_id (ANPR) }
  Creates: Gate records
  Idempotency: deletes all existing gates for facility before recreating

Step 8 — Set Pricing & Complete
  Input: hourly_rate, currency, grace_period_minutes, minimum_fee
  Validation before completion:
    • At least one ENTRY gate exists
    • At least one EXIT gate exists  
    • Every ANPR gate has an ANPR camera assigned
    • Every PARKING_SLOT_CAM (that has been through extraction) has at least one confirmed slot
  On success: sets onboarding_status = COMPLETED
```

---

## 11. Fee Calculation

### Formula

```
duration_minutes = ceil((exit_time - entry_time) / 60_000)

billable_minutes = max(0, duration_minutes - grace_period_minutes)

raw_fee = (billable_minutes / 60) × hourly_rate

final_fee = max(minimum_fee, raw_fee)

fee = round(final_fee, 2)   ← rounded to 2 decimal places
```

### Example

```
Facility: hourly_rate = ₹40, grace_period = 10min, minimum_fee = ₹10

Scenario A — 25 minute stay:
  billable_minutes = 25 - 10 = 15
  raw_fee = (15/60) × 40 = ₹10.00
  final_fee = max(10, 10) = ₹10.00

Scenario B — 2 hour 15 minute stay:
  duration = 135 min
  billable = 135 - 10 = 125 min
  raw_fee = (125/60) × 40 = ₹83.33
  final_fee = max(10, 83.33) = ₹83.33

Scenario C — 5 minute stay (within grace period):
  billable = max(0, 5 - 10) = 0
  raw_fee = 0
  final_fee = max(10, 0) = ₹10.00  ← minimum fee applies
```

The fee is stored in `ParkingSession.parking_fee` and displayed on the `AmountDueScreen` in the mobile app.

### Payment

Currently the system records fees but **does not process payments**. The Amount Due screen instructs the user to "pay at the counter." Online payment gateway integration is planned for a future phase.

---

## 12. AI Integration — Current State & Roadmap

### Current State — Mocked AI

The system has a fully-built AI abstraction layer but **no live AI model is running**. All AI outputs are simulated.

#### AI Adapter Interface

```typescript
// ai-mock/aiAdapter.interface.ts
interface IAiAdapter {
  extractParkingBoxes(imageUrl: string): Promise<DetectedBox[]>;
  detectPlateAtGate(gateId: number, forcePlate?: string): Promise<PlateReading | null>;
}

interface DetectedBox {
  suggestedCode: string;   // e.g. "A-1"
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
}

interface PlateReading {
  licensePlate: string;   // e.g. "TN01AB1234"
  confidence: number;     // 0.0 – 1.0
}
```

#### Mock Implementation

```typescript
// MockAiAdapter
extractParkingBoxes(imageUrl):
  → Returns a hardcoded array of bounding boxes
  → Simulates 6–10 slots per image with randomised positions

detectPlateAtGate(gateId, forcePlate?):
  → If forcePlate is provided: returns that plate with confidence 0.99
  → Otherwise: returns a random plate from a seed list with confidence 0.75–0.98
```

#### Registry Pattern

```typescript
// registry.ts
let _adapter: IAiAdapter = new MockAiAdapter();

export function setAiAdapter(adapter: IAiAdapter) { _adapter = adapter; }
export function getAiAdapter(): IAiAdapter { return _adapter; }
```

To swap in a real model, you call `setAiAdapter(new RealAiAdapter())` at server startup — no other code changes required.

---

### AI Roadmap — What Will Be Integrated

#### Phase 1 — ANPR (Number Plate Recognition)
**Goal**: Replace `MockAiAdapter.detectPlateAtGate()` with real plate reading.

```
Options being evaluated:
  • OpenALPR (open-source, self-hosted)
  • Plate Recognizer API (cloud, pay-per-read)
  • Custom YOLOv8 + OCR pipeline (fine-tuned on Indian plates)

Integration point:
  GateScanService.scanEntry() and scanExit()
  → calls getAiAdapter().detectPlateAtGate(gateId)
  → swap mock → real with setAiAdapter(new AnprAdapter(apiKey))
```

#### Phase 2 — Slot Occupancy Detection
**Goal**: Replace `MockAiAdapter.extractParkingBoxes()` and add real-time slot monitoring.

```
Onboarding (one-time):
  • Camera captures empty lot image
  • YOLOv8 (or similar) segments the frame into individual slot regions
  • Bounding boxes stored as RawSlotDetection records
  • Operator reviews and confirms

Real-time (continuous):
  • Each PARKING_SLOT_CAM streams frames every N seconds
  • Model classifies each confirmed slot region as EMPTY or OCCUPIED
  • Backend updates ParkingSlot.status accordingly
  • Socket.IO broadcasts slot:statusChanged to admin dashboard

Architecture for real-time pipeline:
  Camera feed → Frame capture service
             → AI inference (per-slot classification)
             → POST /api/v1/cameras/:id/detections
             → Backend updates DB + emits socket event
```

#### Phase 3 — Intelligent Allocation
**Goal**: Improve slot allocation using predictive occupancy data.

```
Current: score = 1/distance (simple proximity)

Future: score = f(distance, historical_turnover_rate, 
                  predicted_vacancy_duration, 
                  slot_type_preference)
```

#### Phase 4 — Anomaly Detection
**Goal**: Auto-generate alerts for suspicious patterns.

```
Examples:
  • Vehicle parked without a session (unauthorised)
  • Plate mismatch between entry scan and camera observation
  • Unusually long occupancy in a premium slot
  • Gate camera confidence consistently < 0.6 (hardware issue)
```

---

## 13. Security & Authentication

### JWT Strategy

```
Access token:   15 minutes TTL, signed with JWT_SECRET
Refresh token:  7 days TTL, signed with JWT_REFRESH_SECRET

Flow:
  Login → { accessToken, refreshToken }
  Each API call → Authorization: Bearer <accessToken>
  On 401 → App calls POST /auth/refresh → new token pair
  On logout → Tokens discarded client-side
```

### Role-Based Access Control

| Role | Who | Permissions |
|---|---|---|
| `PARKER` | Mobile app users | Own sessions, own vehicles, own profile |
| `OPERATOR` | Facility staff (future) | Read-only dashboard, resolve alerts |
| `SUPER_ADMIN` | Top-level admin | All facilities, all data |
| `FACILITY_ADMIN` | Per-facility admin | Own facility data only |
| `SECURITY_STAFF` | Gate operators | Session management only |

### Gate QR Security

Each gate QR encodes `{"gateId": N, "type": "ENTRY"|"EXIT"}`. QR codes are rotatable via the "Regenerate" button in the admin console, which generates a new unique `qr_code` string in the database. Old QRs become invalid immediately.

### Data Isolation

All admin queries are scoped to `facility_id`. A `FACILITY_ADMIN` for Facility A cannot read or modify Facility B's data — enforced in the service layer, not just middleware.

---

## 14. Environment Setup & Running Locally

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or run via Docker)
- Flutter SDK 3.x
- Android SDK (for mobile app)

### Quick Start

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Backend
cd backend
cp ../.env.example .env          # fill in DATABASE_URL, JWT secrets
npm install
npx prisma migrate deploy        # apply all migrations
npm run seed                     # populate test data
npm run dev                      # server on http://localhost:4000

# 3. Admin Console
cd adminFrontend
npm install
npm run dev                      # opens http://localhost:5173

# 4. Mobile App
cd App
flutter pub get
# Edit lib/services/api_client.dart: set _baseUrl to your machine's LAN IP
# e.g. const _baseUrl = 'http://192.168.1.100:4000/api/v1';
flutter run -d <device-id>
```

### Environment Variables

```env
# backend/.env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_parking?schema=public"
JWT_SECRET="change-this-in-production"
JWT_REFRESH_SECRET="change-this-too"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

### Seed Data (Default)

| Entity | Value |
|---|---|
| Admin login | `admin@smartpark.com` / `password123` |
| Parker login | `parker@test.com` / `password123` |
| Facility | City Center Mall (ID: 1) |
| Entry Gate | Gate ID: 1 (ENTRY, QR: `{"gateId":1,"type":"ENTRY"}`) |
| Exit Gate | Gate ID: 2 (EXIT, QR: `{"gateId":2,"type":"EXIT"}`) |
| Vehicle | `TN01AB1234` (Car, registered to parker) |

### Full Database Reset

```bash
cd backend
npx prisma migrate reset --force   # drops + recreates DB + runs seed
```

---

## 15. Testing Strategy

### Backend Tests (Jest + Supertest)

```
tests/e2e/onboarding.test.ts
  → Full 8-step onboarding wizard walkthrough
  → Verifies facility, zones, cameras, slots, gates created correctly

tests/e2e/sessionFlow.test.ts
  → Entry scan → confirm entry → confirm parked → exit scan → verify fee

tests/unit/feeCalculator.test.ts
  → Grace period edge cases
  → Minimum fee enforcement
  → Zero-duration stays

tests/unit/allocationEngine.test.ts
  → Slot selection by proximity
  → Exclusion of non-AVAILABLE slots
  → Concurrent allocation safety
```

Run: `cd backend && npm test`

### Admin Frontend Tests (Vitest + MSW + RTL)

```
src/tests/Login.test.tsx
  → Renders form, submits credentials, handles error response

src/tests/LiveMonitoring.test.tsx
  → Slot grid renders, status colours correct, socket update refreshes grid

src/tests/OnboardingWizard.test.tsx
  → Step navigation, form validation, back-navigation
```

Run: `cd adminFrontend && npm run test`

### Mobile App Tests (Flutter Test)

```
test/widget_test.dart             → App renders without crash
test/login_screen_test.dart       → Form validation, submit triggers auth
test/home_screen_test.dart        → Active session card renders
test/scan_gate_screen_test.dart   → QR parse, wrong-type rejection
test/slot_allocated_screen_test.dart → Auto-nav, confirm parked
test/active_session_screen_test.dart → Timer starts, elapsed display
test/history_screen_test.dart     → Session list renders
```

Run: `cd App && flutter test`

---

## 16. Key Design Decisions & Constraints

### Why Prisma + PostgreSQL?

Prisma gives us type-safe database access with auto-generated TypeScript types from the schema. PostgreSQL was chosen over SQLite for production-grade relational integrity and for supporting concurrent writes during peak parking hours.

### Why Socket.IO instead of SSE?

Server-Sent Events are one-way. The dashboard needed a two-way channel (admin can send commands in future phases). Socket.IO also handles reconnection and room-based broadcasting more cleanly for multi-facility deployments.

### Why Riverpod over Provider or Bloc?

Riverpod 2.x gives us compile-time safety, no `BuildContext` dependency for state reads, and a clean way to auto-dispose providers. The `listenManual` API was specifically needed for the GoRouter auth guard which lives outside the widget tree.

### Why GoRouter?

GoRouter is Flutter's officially recommended navigation solution. Its declarative route configuration and `redirect` guard integrate cleanly with Riverpod's `authProvider` for protecting routes.

### Why is `confirmParked` a separate step?

In a real facility, the driver enters through the gate (which triggers ANPR detection and slot allocation) and then physically walks/drives to their slot. There is a deliberate gap in time between "gate scanned" (RESERVED) and "car parked" (ACTIVE). This two-step model lets the admin see exactly how many vehicles are en-route vs. physically occupying slots.

### AI Mocking Strategy

Rather than hard-coding fake responses in production code, all AI calls go through the `IAiAdapter` interface. The `MockAiAdapter` implements this interface. When a real model is ready, we create `RealAiAdapter implements IAiAdapter` and call `setAiAdapter(new RealAiAdapter())` at startup. Zero changes to business logic.

### Cross-Platform QR Security

QR codes include a `"type"` field so the mobile app can reject wrong-type gates before even making an API call. The backend enforces the same check as a server-side safety net, preventing any client that bypasses the app (e.g. direct API calls) from misusing a gate.

### Onboarding Idempotency

Every onboarding step that modifies data is idempotent:
- `createGates` deletes existing gates before recreating (safe to re-run Step 7)
- `createZones` shows existing zones read-only if already created
- `confirmDetection` is a no-op if the detection is already CONFIRMED

This ensures the wizard is safe to navigate backwards without corrupting data.

---

*Document maintained alongside codebase. Last updated: August 2026.*
