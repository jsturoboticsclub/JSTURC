# Design: Comprehensive Platform Upgrade & Architecture Modernization

## Context
See [proposal.md](proposal.md) for background and motivation. The JSTURC codebase uses React 18 with Vite on the frontend and Express + SQLite/Turso on the backend. As the platform expanded with 3D canvas, tech tree, dynamic committees, and rich showcase profiles, key administrative and route files grew into multi-thousand-line singletons.

## Goals / Non-Goals

**Goals:**
- Provide a responsive hardware inventory requisition and loan management system for lab members and managers.
- Implement scannable digital passes with tamper-evident QR verification tokens for event RSVPs.
- Deconstruct the monolithic `AdminCMSPanel.tsx` (268KB) into clean, maintainable domain tabs under `src/components/admin/tabs/`.
- Decouple `jstuRoutes.js` into domain routers (`memberRouter`, `committeeRouter`, `hardwareRouter`).
- Secure all secrets (`Robotics_secret.json`) and apply rate-limiting guards to sensitive endpoints.
- Ensure 3D Canvas on mobile viewports allows smooth natural page scrolling.

**Non-Goals:**
- Replacing Express or SQLite with a different backend runtime or database engine.
- Rebuilding the Three.js 3D model geometry from scratch.
- Breaking backwards compatibility of any existing API endpoints.

## Decisions

### 1. Hardware Loan State Machine & Schema
- **Database Table**: `hardware_loans`
  ```sql
  CREATE TABLE IF NOT EXISTS hardware_loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    hardware_id INTEGER NOT NULL REFERENCES hardware_showcase(id),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, active, returned, rejected
    requested_duration_days INTEGER NOT NULL DEFAULT 7,
    project_name TEXT,
    purpose TEXT,
    approved_by INTEGER REFERENCES users(id),
    loaned_at DATETIME,
    expected_return_at DATETIME,
    returned_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```
- **Stock Tracking**: Add `quantity INTEGER DEFAULT 1` and `available_quantity INTEGER DEFAULT 1` to `hardware_showcase`.
- **Alternative Considered**: Managing loans manually via Google Sheets.
  *Rationale*: In-app requests allow seamless correlation with the member's public portfolio and showcase projects.

### 2. Client-Side SVG QR Code Passes & Server Verification
- **QR Generation**: Use pure SVG QR rendering on `EventDetailPage.tsx` for RSVP ticket passes.
- **Verification Token**: Base64 encoded signed payload `eventId:userId:rsvpTimestamp:hash`.
- **Verification Endpoint**: `POST /api/events/:id/verify-ticket` checks token validity and updates `event_attendees` with `checked_in = 1, checked_in_at = CURRENT_TIMESTAMP`.

### 3. Modular Admin CMS Tabs Architecture
- Split `AdminCMSPanel.tsx` into domain subcomponents:
  - `src/components/admin/tabs/AdminHardwareTab.tsx`
  - `src/components/admin/tabs/AdminCommitteesTab.tsx`
  - `src/components/admin/tabs/AdminMembersTab.tsx`
  - `src/components/admin/tabs/AdminAnnouncementsTab.tsx`
  - `src/components/admin/tabs/AdminSiteConfigTab.tsx`
- The parent `AdminCMSPanel.tsx` serves as the layout frame and state coordinator, drastically reducing individual module compilation and editing overhead.

### 4. Mobile 3D Canvas Touch Isolation
- On `RoboticsCanvas3D.tsx`, set canvas container CSS to `touch-action: pan-y`.
- Disable OrbitControls rotation on single-finger touch when scrolling page, or enable full 3D manipulation only when user explicitly toggles "Interact 3D" or uses two fingers.

## Risks / Trade-offs

- **[Risk] Route Refactoring Disruptions** → *Mitigation*: Maintain identical route paths and signatures when decoupling routers; verify with comprehensive curl/fetch test suite.
- **[Risk] Schema Migration on SQLite** → *Mitigation*: Use idempotent `CREATE TABLE IF NOT EXISTS` and conditional column additions with PRAGMA table_info checks.
- **[Risk] Mobile Performance with QR rendering** → *Mitigation*: Render QR SVG synchronously without external network requests or large canvas dependencies.
