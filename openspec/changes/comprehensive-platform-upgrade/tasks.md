# Tasks: Comprehensive Platform Upgrade & Architecture Modernization

## 1. Security & Hygiene Foundation

- [x] 1.1 Add `Robotics_secret.json` to `.gitignore` to prevent credential exposure and verify with `git status`
- [x] 1.2 Implement rate limiting middleware on authentication and username lookup endpoints and verify via repeated curl requests

## 2. Hardware Lab Requisition & Loan System

- [x] 2.1 Add `hardware_loans` table and quantity columns to SQLite schema in `uniclub-backend/db.js` and verify table creation
- [x] 2.2 Implement hardware loan requisition, approval, and return endpoints in backend and verify via API test script
- [x] 2.3 Build "Request Equipment Loan" modal in `src/components/showcase/HardwareDetailModal.tsx` and verify borrow submission UI
- [x] 2.4 Add Hardware Loan Management interface to Admin CMS to inspect, approve, and track loaned equipment

## 3. Event Digital Passes & Attendance Check-In

- [x] 3.1 Implement attendance verification endpoint `POST /api/events/:id/verify-ticket` in backend and verify validation logic
- [x] 3.2 Add dynamic QR admission pass generator in `src/pages/EventDetailPage.tsx` for RSVP'd members and verify ticket display
- [x] 3.3 Add event attendance check-in scanner/search tool in Admin CMS for workshop coordinators

## 4. Admin CMS Modularization & Mobile Polish

- [x] 4.1 Modularize `AdminCMSPanel.tsx` by extracting domain sub-tabs into `src/components/admin/tabs/` and verify clean rendering
- [x] 4.2 Decouple `uniclub-backend/routes/jstuRoutes.js` into domain routers (`memberRouter`, `committeeRouter`, `hardwareRouter`) and verify all endpoints resolve correctly
- [x] 4.3 Add mobile touch gesture isolation to `src/components/canvas/RoboticsCanvas3D.tsx` to ensure smooth vertical page scrolling on touch devices

## 5. Validation & Quality Assurance

- [x] 5.1 Run `npm run build` to confirm zero frontend TypeScript or bundling regressions
- [x] 5.2 Validate OpenSpec change compliance via `openspec validate --change comprehensive-platform-upgrade`
