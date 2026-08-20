# Parkit — FAQ & Troubleshooting

Common errors encountered during development, setup, and testing — with their root causes and exact fixes.

---

## Table of Contents

**Backend**
- [B1 — `prisma migrate dev` fails in non-interactive terminal](#b1--prisma-migrate-dev-fails-in-non-interactive-terminal)
- [B2 — `EPERM: operation not permitted, rename` during `prisma generate`](#b2--eperm-operation-not-permitted-rename-during-prisma-generate)
- [B3 — Backend crashes: `Cannot find module` or `MODULE_NOT_FOUND`](#b3--backend-crashes-cannot-find-module-or-module_not_found)
- [B4 — `401 Unauthorized` on every request after DB reset](#b4--401-unauthorized-on-every-request-after-db-reset)
- [B5 — TypeScript errors `TS7030` / `TS2345` in controllers](#b5--typescript-errors-ts7030--ts2345-in-controllers)
- [B6 — `TypeError: Cannot read properties of undefined (reading 'id')`](#b6--typeerror-cannot-read-properties-of-undefined-reading-id)

**Admin Console**
- [A1 — White screen / blank page after login](#a1--white-screen--blank-page-after-login)
- [A2 — Live Monitoring grid doesn't update in real time](#a2--live-monitoring-grid-doesnt-update-in-real-time)
- [A3 — Onboarding wizard stuck: "Gate must have ANPR camera assigned"](#a3--onboarding-wizard-stuck-gate-must-have-anpr-camera-assigned)
- [A4 — First Floor shows "No slots configured" after onboarding](#a4--first-floor-shows-no-slots-configured-after-onboarding)
- [A5 — "Complete Onboarding" button stays disabled](#a5--complete-onboarding-button-stays-disabled)

**Mobile App — Build Errors**
- [M1 — `java.lang.IllegalArgumentException: this and base files have different roots`](#m1--javalangillegalargumentexception-this-and-base-files-have-different-roots)
- [M2 — `AppColors` not defined / `The getter 'AppColors' isn't defined`](#m2--appcolors-not-defined--the-getter-appcolors-isnt-defined)
- [M3 — `No named parameter with the name 'label'` in SlotBadge](#m3--no-named-parameter-with-the-name-label-in-slotbadge)
- [M4 — `SingleTickerStateMixin` not found](#m4--singletickerstaitemixin-not-found)
- [M5 — Duplicate provider declarations (`lastCompletedSessionProvider`)](#m5--duplicate-provider-declarations-lastcompletedsessionprovider)
- [M6 — App not configured to build on the web](#m6--app-not-configured-to-build-on-the-web)

**Mobile App — Runtime Errors**
- [M7 — App crashes: "Assertion failed: ref.listen can only be used within the build method"](#m7--app-crashes-assertion-failed-reflisten-can-only-be-used-within-the-build-method)
- [M8 — App can't connect to backend ("Connection refused" / DioException)](#m8--app-cant-connect-to-backend-connection-refused--dioexception)
- [M9 — Slot stays RESERVED in admin after pressing "Confirm Parked"](#m9--slot-stays-reserved-in-admin-after-pressing-confirm-parked)
- [M10 — Timer shows 00:00:00 and never starts on Active Session screen](#m10--timer-shows-000000-and-never-starts-on-active-session-screen)
- [M11 — "This is an exit gate QR" error when scanning entry gate](#m11--this-is-an-exit-gate-qr-error-when-scanning-entry-gate)
- [M12 — Login gives 401 after resetting the database](#m12--login-gives-401-after-resetting-the-database)

---

---

## Backend

---

### B1 — `prisma migrate dev` fails in non-interactive terminal

**Error message:**
```
Error: Prisma Migrate has detected that the environment is non-interactive.
```

**Cause:**
`prisma migrate dev` requires an interactive terminal to confirm destructive operations. CI pipelines and some terminal emulators are detected as non-interactive.

**Fix:**
Use `migrate deploy` for applying existing migrations, and `migrate diff` + `migrate resolve` for creating new ones manually:

```bash
# Apply existing migrations (safe for any environment)
npx prisma migrate deploy

# If you're creating a NEW migration:
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/$(date +%Y%m%d%H%M%S)_name/migration.sql

npx prisma migrate deploy
```

---

### B2 — `EPERM: operation not permitted, rename` during `prisma generate`

**Error message:**
```
Error: EPERM: operation not permitted, rename 'C:\...\node_modules\.prisma\...'
```

**Cause:**
Windows file locking. Another process (the running dev server or your IDE) has a lock on the Prisma client files.

**Fix:**
1. Stop the backend server (`Ctrl+C`)
2. Close any file explorer windows pointing to `node_modules`
3. Re-run `npx prisma generate`
4. Restart the server

---

### B3 — Backend crashes: `Cannot find module` or `MODULE_NOT_FOUND`

**Error message:**
```
Error: Cannot find module '../services/someService'
```

**Cause:**
Usually means `npm install` was not run after pulling new code, or a new file was added but TypeScript compilation failed silently.

**Fix:**
```bash
cd backend
npm install
npm run build   # check for TS errors
npm run dev
```

---

### B4 — `401 Unauthorized` on every request after DB reset

**Symptom:**
After running `npx prisma migrate reset`, the admin console login gives 401 on every attempt.

**Cause:**
`migrate reset` wipes the entire database including all user accounts. The old admin credentials no longer exist.

**Fix — Option A (recommended):** Re-seed the database:
```bash
cd backend
npm run seed
```
Then log in with `admin@smartpark.com` / `password123`.

**Fix — Option B:** Go to `http://localhost:5173/` (the root URL). If onboarding status is `NOT_STARTED`, you'll see the "Start Onboarding" page where you can create a new admin account.

---

### B5 — TypeScript errors `TS7030` / `TS2345` in controllers

**Error messages:**
```
TS7030: Not all code paths return a value.
TS2345: Argument of type 'string | undefined' is not assignable to type 'number'.
```

**Cause:**
- `TS7030`: A controller function is missing a `return` statement in some branches.
- `TS2345`: Route params (e.g. `req.params.id`) are always `string` but the service expects `number`.

**Fix:**
Use the `parseId` utility for all numeric route params:

```typescript
import { parseId } from '../utils/parseId';

const id = parseId(req.params.id); // throws 400 if not a valid integer
```

Ensure every code path in the controller ends with `return res.json(...)` or `return next(error)`.

---

### B6 — `TypeError: Cannot read properties of undefined (reading 'id')`

**Error:**
```
TypeError: Cannot read properties of undefined (reading 'id')
    at onboardingController.ts:XX
```

**Cause:**
Trying to access `req.user.id` when the auth middleware didn't attach a user (e.g., a route that should be authenticated is being hit without a token, or the route is mistakenly marked as public).

**Fix:**
1. Check that the route is behind `authMiddleware` in its router file.
2. Ensure the request includes `Authorization: Bearer <token>`.
3. For onboarding Step 1 (create facility + admin), the route is intentionally unauthenticated — use `req.body` for the admin ID, not `req.user`.

---

---

## Admin Console

---

### A1 — White screen / blank page after login

**Symptom:**
Login succeeds but the page is blank or shows a React error boundary.

**Cause — most common:** The backend is not running or is on a different port than `CORS_ORIGIN` expects.

**Fix:**
1. Confirm backend is running: open `http://localhost:4000/api/v1/health` in the browser
2. Check `backend/.env` has `CORS_ORIGIN="http://localhost:5173"`
3. Restart both servers
4. Clear browser localStorage (`F12 → Application → Local Storage → Clear All`) and try again

---

### A2 — Live Monitoring grid doesn't update in real time

**Symptom:**
Slot statuses change in the database (confirmed via the Entry & Exit page) but the grid in Live Monitoring doesn't reflect it without a manual refresh.

**Cause:**
The Socket.IO connection to `/dashboard` isn't established, or the socket isn't joined to the correct `facility_<id>` room.

**Fix:**
1. Open browser DevTools → Console → look for Socket.IO connection errors
2. Confirm `activeFacilityId` is set (check the facility selector in the top bar — it must not be empty)
3. Check that `CORS_ORIGIN` in `backend/.env` exactly matches the frontend URL (including port)
4. Hard refresh the admin console (`Ctrl+Shift+R`)

---

### A3 — Onboarding wizard stuck: "Gate must have ANPR camera assigned"

**Symptom:**
Step 8 (Review & Complete) shows the error "Gate must have ANPR camera assigned" even though you assigned cameras in Step 7.

**Cause:**
The camera you assigned to the gate in Step 7 was created as type `PARKING_SLOT_CAM` (the default when adding cameras in Step 3), not `ANPR`. Gates require an `ANPR` type camera.

**Fix:**
1. Click on the completed Step 3 badge to go back
2. Add a new camera and set its type to `ANPR`
3. Proceed back to Step 7 and assign the new ANPR camera to the gate

> The wizard now shows an **orange warning banner** in Step 3 if no ANPR camera exists, and defaults new camera entries to `ANPR` type when one is missing.

---

### A4 — First Floor shows "No slots configured" after onboarding

**Symptom:**
Live Monitoring shows all slots in Ground Floor only. First Floor zone is empty despite assigning cameras to it.

**Cause:**
During the Step 6 duplicate review, the slot's zone was incorrectly defaulting to the first zone (Ground Floor) regardless of which camera detected it.

**Fix — for existing data:**
1. Go to **Configuration → Slots** tab
2. Click the **"Fix slot zones"** button
3. This runs `POST /api/v1/onboarding/realign-slot-zones` which updates every slot's `zone_id` to match its primary camera's zone

**Fix — for new onboardings:** Already fixed in the current version. The zone defaults to the detecting camera's zone automatically.

---

### A5 — "Complete Onboarding" button stays disabled

**Symptom:**
The "Complete Onboarding" button on Step 8 is greyed out or clicking it shows a validation error.

**Checklist — verify each:**

| Check | How to verify |
|---|---|
| At least one ENTRY gate exists | Configuration → Gates tab |
| At least one EXIT gate exists | Configuration → Gates tab |
| Every gate has an ANPR camera assigned | Go back to Step 7 |
| Every `PARKING_SLOT_CAM` that went through extraction has ≥ 1 confirmed slot | Step 6 review |

> Note: A `PARKING_SLOT_CAM` that was added but **never had extraction run** is exempt from the slot requirement. Only cameras that went through Step 5 (Extract Boxes) are validated.

---

---

## Mobile App — Build Errors

---

### M1 — `java.lang.IllegalArgumentException: this and base files have different roots`

**Full error:**
```
java.lang.IllegalArgumentException: this and base files have different roots:
C:\Users\...\Pub\Cache\...\mobile_scanner\...
and
E:\Final Year Project\Workspace\v01\App\android
```

**Cause:**
Kotlin's incremental compiler cannot handle relative paths between files on different drive letters (e.g. project on `E:`, Pub cache on `C:`). This is a known Windows-specific issue with the Kotlin Gradle Plugin.

**Fix — Option A (quick, recommended for now):**
Add the following line to `App/android/gradle.properties`:
```properties
kotlin.incremental=false
```
Then clean and rebuild:
```bash
cd App
flutter clean
flutter run -d <device-id>
```

**Fix — Option B (permanent):**
Move the entire project to the same drive as your Pub cache (usually `C:`). This eliminates the cross-drive path issue entirely.

---

### M2 — `AppColors` not defined / `The getter 'AppColors' isn't defined`

**Error message:**
```
lib/screens/profile_screen.dart:46:24: Error: The getter 'AppColors' isn't defined
```

**Cause:**
A screen or widget is referencing an old `AppColors` class that was removed when the design system was migrated to the new `Pk` token system in `theme.dart`.

**Fix:**
Replace all `AppColors.*` references with `Pk.*` equivalents:

| Old | New |
|---|---|
| `AppColors.bgBase` | `Pk.bg` |
| `AppColors.brand` | `Pk.primary` |
| `AppColors.textMuted` | `Pk.textMuted` |
| `AppColors.occupied` | `Pk.dangerLt` |
| `AppColors.available` | `Pk.successLt` |

Also add `import '../theme.dart';` at the top of the file if missing.

---

### M3 — `No named parameter with the name 'label'` in SlotBadge

**Error message:**
```
lib/screens/slot_allocated_screen.dart:135:31: Error: No named parameter with the name 'label'.
    SlotBadge(label: slotLabel, large: true),
```

**Cause:**
`SlotBadge` was originally defined with parameter `code`, which was renamed to `label` during the redesign. The call site may still use the old name, or vice versa.

**Fix:**
Ensure `App/lib/widgets/slot_badge.dart` defines:
```dart
const SlotBadge({
  super.key,
  required this.label,   // ← must be 'label', not 'code'
  this.zoneLabel,
  this.large = false,
});
```
And the call site uses `SlotBadge(label: slotLabel, large: true)`.

---

### M4 — `SingleTickerStateMixin` not found

**Error message:**
```
Error: 'SingleTickerStateMixin' isn't a type.
```

**Cause:**
The correct Flutter mixin name is `SingleTickerProviderStateMixin`, not `SingleTickerStateMixin`.

**Fix:**
In any file showing this error, replace:
```dart
// Wrong:
with SingleTickerStateMixin

// Correct:
with SingleTickerProviderStateMixin
```

Affected files: `slot_allocated_screen.dart`, `gradient_button.dart` (or any widget using `AnimationController`).

---

### M5 — Duplicate provider declarations (`lastCompletedSessionProvider`)

**Error message:**
```
Error: 'lastCompletedSessionProvider' is already defined.
```

**Cause:**
`lastCompletedSessionProvider` (and/or `pendingEntryProvider`) was declared twice in `session_provider.dart` — once near the top and once near the bottom of the file.

**Fix:**
Open `App/lib/providers/session_provider.dart` and search for duplicate `final lastCompletedSessionProvider` and `final pendingEntryProvider` declarations. Remove the duplicates, keeping only one of each.

---

### M6 — App not configured to build on the web

**Error message:**
```
Error: This application is not configured to build on the web.
```

**Cause:**
Flutter web support was not added to the project when it was first created.

**Fix:**
```bash
cd App
flutter create . --platforms=web
```

This adds the required web platform files without touching your existing Dart code.

---

---

## Mobile App — Runtime Errors

---

### M7 — App crashes: "Assertion failed: ref.listen can only be used within the build method"

**Full error:**
```
Assertion failed: "ref.listen can only be used within the build method (or a Riverpod hook)"
```

**Cause:**
In `router.dart`, the `_AuthListenable` class was calling `ref.listen` inside its constructor (which is called from `initState`). Riverpod 2.x forbids `ref.listen` outside of `build`.

**Fix:**
Use `ref.listenManual` in `initState` and store the subscription for disposal:

```dart
class _AuthListenable extends ChangeNotifier {
  ProviderSubscription? _sub;

  _AuthListenable(Ref ref) {
    _sub = ref.listenManual(authProvider, (_, __) => notifyListeners());
  }

  @override
  void dispose() {
    _sub?.close();
    super.dispose();
  }
}
```

---

### M8 — App can't connect to backend ("Connection refused" / DioException)

**Symptom:**
Every API call fails with `DioException: Connection refused` or `SocketException: Failed host lookup`.

**Cause — most common:**
The base URL in `api_client.dart` is set to `localhost` (or `127.0.0.1`), which resolves to the phone itself, not your PC.

**Fix:**
1. Find your PC's LAN IP address:
   - Windows: open Command Prompt → `ipconfig` → IPv4 Address under your Wi-Fi adapter
   - Example: `192.168.1.45`
2. Edit `App/lib/services/api_client.dart`:
   ```dart
   const _baseUrl = 'http://192.168.1.45:4000/api/v1';
   ```
3. Ensure your phone and PC are on the **same Wi-Fi network**
4. Ensure your firewall allows inbound connections on port `4000`
   - Windows Firewall: search "Windows Firewall" → "Allow an app through firewall" → add Node.js

---

### M9 — Slot stays RESERVED in admin after pressing "Confirm Parked"

**Symptom:**
The driver pressed "Confirm Parked" in the app, but the admin's Live Monitoring still shows the slot as orange (RESERVED) instead of red (OCCUPIED).

**Cause:**
The 8-second auto-navigation timer in `SlotAllocatedScreen` was firing before the user pressed the button, navigating to `ActiveSessionScreen` without calling the `confirmParked` API. The session stayed in RESERVED state with no `entry_time`.

**Status:** Fixed in current version.

The auto-nav now calls `confirmParked` before navigating. Additionally, `ActiveSessionScreen` has a failsafe that auto-calls `confirmParked` if the session is still RESERVED when the screen loads.

If you still see this behaviour, do a hot restart (`R` in the flutter terminal) to pick up the fix.

---

### M10 — Timer shows 00:00:00 and never starts on Active Session screen

**Symptom:**
The "Time Parked" clock on the Active Session screen is frozen at `00:00:00`.

**Cause:**
The timer only ticks when `session.entryTime != null`. The `entry_time` field is set by the backend when `confirmParked` is called. If `confirmParked` was never called (see M9 above), `entryTime` is null and the timer has nothing to calculate.

**Status:** Fixed together with M9.

If you see this on an existing session (after updating the app), it means that session was created before the fix. The timer will start correctly for new sessions.

---

### M11 — "This is an exit gate QR" error when scanning entry gate

**Symptom:**
Scanning a gate QR at the entry scan screen shows: *"This is an exit gate QR. Please scan an ENTRY gate QR code."*

**Cause:**
The QR code being scanned was generated by the admin console **before** the gate-type payload was added to QRs. Old QRs encode only `{"gateId": 1}` with no `type` field, and the default fallback may be treating them as exit gates.

**Fix:**
Regenerate the gate QR codes from the admin console:
1. Go to **Configuration → Gates** tab (or the **Gates & QR Codes** page)
2. Click **Regenerate** on the entry gate
3. Reprint or re-display the new QR code

New QRs encode `{"gateId": 1, "type": "ENTRY"}` and will work correctly.

---

### M12 — Login gives 401 after resetting the database

**Symptom:**
The app shows "Invalid credentials" immediately after a database reset.

**Cause:**
Same as [B4](#b4--401-unauthorized-on-every-request-after-db-reset) — the database reset wiped all user accounts. The app is trying to use a stored JWT token from before the reset, which is now invalid.

**Fix:**
1. Log out of the app (Profile → Logout)
2. On the backend, run: `npm run seed`
3. Log back in with `parker@test.com` / `password123`

Or if the seed data is undesirable, register a new account from the app's Register screen.

---

## Still Stuck?

1. Check the **backend terminal** for error stack traces — most issues have a clear error message there
2. Check the **browser DevTools console** for admin console issues
3. Check the **Flutter debug output** (`flutter run` terminal) for app issues — look for lines starting with `E/flutter`
4. See [`docs/FULL_TECHNICAL_DOCUMENT.md`](./FULL_TECHNICAL_DOCUMENT.md) for deep-dive on architecture and design decisions
