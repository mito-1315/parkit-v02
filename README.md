# Parkit — Smart Parking System

A full-stack smart parking management system with a **Node.js backend**, **React admin console**, and **Flutter mobile app**.

> **Docs**: See [`docs/`](./docs) for the full technical document and handover notes.

---

## What's in this repo?

```
v01/
├── backend/          Node.js + Express + Prisma (REST API + Socket.IO)
├── adminFrontend/    React + Vite admin console (web)
├── App/              Flutter mobile app (Android/iOS)
└── docs/             Technical documents
```

---

## Prerequisites

Make sure the following are installed on your machine before starting.

| Tool | Version | Download |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| npm | 9+ | (bundled with Node.js) |
| PostgreSQL | 15+ | https://www.postgresql.org/download |
| Flutter SDK | 3.x | https://docs.flutter.dev/get-started/install |
| Android Studio | Latest | https://developer.android.com/studio |
| Git | Any | https://git-scm.com |

> **Tip — PostgreSQL via Docker**: If you don't want to install PostgreSQL directly, run `docker-compose up -d` from the project root (requires Docker Desktop).

---

## 1. Clone the repository

```bash
git clone <repo-url>
cd v01
```

---

## 2. Backend Setup

```bash
cd backend
```

### 2a. Install dependencies

```bash
npm install
```

### 2b. Configure environment variables

Copy the example file and fill in your values:

```bash
cp ../.env.example .env
```

Open `backend/.env` and set:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_parking?schema=public"
JWT_SECRET="any-long-random-string"
JWT_REFRESH_SECRET="another-long-random-string"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

> Change `postgres:postgres` to your PostgreSQL username:password if different.

### 2c. Create the database

```bash
# Create the database in PostgreSQL first (run in psql or pgAdmin):
# CREATE DATABASE smart_parking;

# Then apply all migrations:
npx prisma migrate deploy
```

### 2d. Seed test data

```bash
npm run seed
```

This creates:
- Admin account: `admin@smartpark.com` / `password123`
- Parker account: `parker@test.com` / `password123`
- A sample facility, zones, slots, cameras, and gates

### 2e. Start the development server

```bash
npm run dev
```

Backend is now running at **http://localhost:4000**

---

## 3. Admin Console Setup

Open a new terminal:

```bash
cd adminFrontend
npm install
npm run dev
```

Admin console is now running at **http://localhost:5173**

**Log in with**: `admin@smartpark.com` / `password123`

---

## 4. Mobile App Setup

### 4a. Install Flutter dependencies

```bash
cd App
flutter pub get
```

### 4b. Set the backend URL

Open `App/lib/services/api_client.dart` and update the base URL to your **machine's local IP address** (not `localhost` — the phone can't reach your PC via `localhost`):

```dart
const _baseUrl = 'http://192.168.X.X:4000/api/v1';
//                        ^^^^^^^^^^^^ your machine's LAN IP
```

Find your LAN IP:
- **Windows**: `ipconfig` → look for "IPv4 Address"
- **Mac/Linux**: `ifconfig` → look for `inet` under your Wi-Fi interface

> Your phone and PC must be on the **same Wi-Fi network**.

### 4c. Connect your Android device

1. Enable **Developer Options** on your phone (tap Build Number 7 times in Settings → About Phone)
2. Enable **USB Debugging**
3. Connect via USB
4. Verify it's detected: `flutter devices`

### 4d. Run the app

```bash
flutter run -d <device-id>
# or just:
flutter run   # if only one device is connected
```

---

## 5. Default Credentials & Test Data

| Account | Email | Password | Role |
|---|---|---|---|
| Admin | `admin@smartpark.com` | `password123` | Facility Admin |
| Parker | `parker@test.com` | `password123` | App User |

| Entity | Details |
|---|---|
| Facility | City Center Mall |
| Entry Gate | ID: 1 — QR payload: `{"gateId":1,"type":"ENTRY"}` |
| Exit Gate | ID: 2 — QR payload: `{"gateId":2,"type":"EXIT"}` |
| Test Vehicle | Plate: `TN01AB1234` (registered to parker account) |

---

## 6. Running Tests

### Backend

```bash
cd backend
npm test
```

### Admin Console

```bash
cd adminFrontend
npm run test
```

### Mobile App

```bash
cd App
flutter test
```

---

## 7. Reset Everything (Fresh Start)

If you want to wipe the database and start clean:

```bash
cd backend
npx prisma migrate reset --force   # drops DB, re-runs migrations, re-seeds
```

> **Note**: This deletes all data. You will need to go through the onboarding wizard again in the admin console.

---

## 8. Common Issues

For a full list of known errors and fixes, see **[`docs/FAQ.md`](./docs/FAQ.md)**.

Quick reference for the most frequent ones:

| Symptom | Likely Cause | Fix |
|---|---|---|
| Backend crashes on start | Missing `.env` or wrong `DATABASE_URL` | Check `backend/.env` |
| `prisma migrate` fails | Database doesn't exist yet | Create DB manually first |
| App can't connect to backend | Using `localhost` instead of LAN IP | Set correct IP in `api_client.dart` |
| App build fails on Android | Project on different drive to Pub cache | See FAQ |
| Login gives 401 after DB reset | Old admin account wiped | Run `npm run seed` again |
| App shows timer at 00:00:00 | `confirmParked` not called | This is fixed in current version |

---

## 9. Project Documentation

| Document | Description |
|---|---|
| [`docs/FULL_TECHNICAL_DOCUMENT.md`](./docs/FULL_TECHNICAL_DOCUMENT.md) | Complete technical reference — architecture, APIs, database schema, AI roadmap |
| [`docs/HANDOVER_DOCUMENT.md`](./docs/HANDOVER_DOCUMENT.md) | Legacy handover notes and quick reference |
| [`docs/FAQ.md`](./docs/FAQ.md) | Troubleshooting guide for common errors |
| [`openapi.yaml`](./openapi.yaml) | OpenAPI 3.0 API specification |

---

## 10. Architecture at a Glance

```
Admin Console (React)  ──HTTP/WS──┐
                                   ├──► Backend (Node.js/Express)  ──► PostgreSQL
Parkit App (Flutter)   ──HTTP──────┘         │
                                              └──► Socket.IO (real-time slot updates)
```

- **Backend** runs on port `4000`
- **Admin console** runs on port `5173`
- **Mobile app** connects to the backend over your local network

---

## 11. Making Changes

### Backend
- Add a new route: `src/routes/` + `src/controllers/` + `src/services/`
- Schema change: edit `prisma/schema.prisma`, then `npx prisma migrate dev --name <description>`
- The server hot-reloads on save (`npm run dev` uses `ts-node-dev`)

### Admin Console
- Vite HMR — changes appear instantly in the browser on save
- API calls live in `src/api/`, pages in `src/pages/`

### Mobile App
- Press `r` in the flutter terminal for hot reload (UI changes)
- Press `R` for hot restart (state/logic changes)
- Structural changes (new packages, native code) require a full rebuild

---

*For questions, check the docs folder or open an issue in the repo.*
