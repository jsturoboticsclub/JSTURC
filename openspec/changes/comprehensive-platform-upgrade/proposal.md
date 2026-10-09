# Proposal: Comprehensive Platform Upgrade & Modernization

## Why
Following a comprehensive gstack architectural and product review (rating: 8.4/10), the JSTU Robotics Club platform has achieved high visual quality and strong member identity. However, key operational gaps prevent it from functioning as a true digital headquarters for the club:
1. The Hardware Lab showcase is currently static and view-only; members cannot requisition microcontrollers, sensors, or lab equipment for their robotics projects.
2. Event registrations lack digital credentialing (passes/QR codes) for real-world workshop attendance check-in.
3. Codebases are growing monolithic (`AdminCMSPanel.tsx` is 268KB, `jstuRoutes.js` is 2,131 lines), reducing maintainability and performance.
4. Production secrets (`Robotics_secret.json`) risk accidental leakage without strict gitignore sanitization, and auth endpoints lack rate-limiting guards.

Executing this upgrade transforms JSTURC into a fully functional, production-hardened university robotics software factory.

## What Changes
- **Hardware Inventory & Loan Requisition System**: Convert static hardware showcase into an active borrowing hub with availability status, requisition requests, return date tracking, and admin approvals.
- **Event Digital Pass & QR Attendance Check-In**: Generate dynamic digital passes with unique QR codes for RSVP'd members, with an event coordinator scanner interface for live event check-in.
- **Admin CMS Monolith Modularization**: Refactor `AdminCMSPanel.tsx` into modular sub-components (`AdminHardwareTab`, `AdminCommitteesTab`, `AdminMembersTab`, `AdminNewsTab`, `AdminSettingsTab`).
- **Backend Route Decoupling**: Split `jstuRoutes.js` into domain-specific routers (`routes/committeeRouter.js`, `routes/hardwareRouter.js`, `routes/memberRouter.js`).
- **Security & Secrets Hardening**: Ensure `Robotics_secret.json` is strictly ignored in `.gitignore`, implement `express-rate-limit` on authentication and lookup routes, and enforce file upload payload size constraints.
- **Mobile 3D Touch Shielding**: Prevent Three.js orbit controls from capturing vertical page scrolling gestures on mobile touchscreens.

## Capabilities

### New Capabilities
- `hardware/checkout-system`: Member equipment loan requests, inventory status tracking (Available, Checked Out, In Maintenance), and lab manager approval dashboard.
- `events/qr-checkin`: Digital ticket pass generation for RSVPs and fast QR/token verification for club workshop attendees.
- `admin/cms-modular-architecture`: Modular CMS panel architecture separating hardware, committees, members, and site configuration for improved maintainability.

### Modified Capabilities
- `landing-page/hero`: Optimize mobile touch interaction so 3D Canvas doesn't trap page scroll gestures.
- `admin/hardware-showcase`: Expand hardware CMS capabilities to manage quantity, inventory status, and active loan requests.

## Impact
- **Database Schema**: New tables `hardware_loans` and `event_checkins`; added `quantity` and `available_quantity` to `hardware_showcase`.
- **Backend Routes**: Decoupled routes, added rate-limiting middleware on auth endpoints.
- **Frontend Components**: Split `AdminCMSPanel.tsx`, added QR/pass modal to `EventDetailPage.tsx`, added checkout modal to `HardwareDetailModal.tsx`.
- **Security & Hygiene**: `.gitignore` updated to guarantee no accidental secret exposure.
