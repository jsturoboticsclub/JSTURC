# Tasks: Modernize Robotics Club Digital Experience

## 1. Visual Foundation and Cybernetic Design Tokens

- [x] 1.1 Add cybernetic CSS utility classes, glowing border animations, and HUD typography variables to `src/index.css` and verify styling builds without CSS errors.
- [x] 1.2 Implement reusable UI primitives (`CyberBadge`, `HudCard`, `GlitchHeader`) in `src/components/common/` and verify visual rendering in isolation.

## 2. Interactive 3D Robotic Hardware Canvas

- [x] 2.1 Install required lightweight 3D rendering dependency (`three` and types) and verify clean `npm install` without version conflicts.
- [x] 2.2 Implement `RoboticsCanvas3D.tsx` featuring an articulated robotic arm with cursor tracking, physics damping, and fallback vector graphics; verify by mounting in `JSTULandingPage.tsx` hero.
- [x] 2.3 Add interactive controls (rotation lock, wireframe mode, reset camera) to `RoboticsCanvas3D.tsx` and verify controls respond to user clicks.

## 3. Real-Time Telemetry and Status Bar

- [x] 3.1 Implement simulated/live telemetry data generator hook `useTelemetry` in `src/hooks/useTelemetry.ts` and verify unit outputs for battery, IMU, and RSSI metrics.
- [x] 3.2 Build `TelemetryBar.tsx` featuring lab operational status ticker, active bot telemetry HUD, and tournament countdown clock; verify display and second-by-second countdown on the landing page.
- [x] 3.3 Add tournament and hackathon countdown configurations to `TelemetryBar.tsx` and verify urgency styling when countdown approaches zero.

## 4. Interactive Robotics Curriculum Tech Tree

- [x] 4.1 Construct curriculum data structure in `src/data/curriculumData.ts` mapping Embedded, ROS2/Autonomous, CAD, and Vision tracks with prerequisites and project tags; verify data types.
- [x] 4.2 Build `TechTree.tsx` with interactive node selection, track filtering tabs, and animated connection pathways; verify node click highlights and prerequisite breadcrumbs.
- [x] 4.3 Add node detail modal/drawer showing study resources, lab hardware links, and matching club projects; verify click opens modal and navigation works.

## 5. Rich Project Showcase Modals & Architecture Inspector

- [x] 5.1 Create `ProjectDetailModal.tsx` displaying BOM, microcontroller architecture, schematics viewer, and GitHub metrics; verify modal opens when clicking featured projects in `JSTULandingPage.tsx`.
- [x] 5.2 Enhance project cards in `JSTULandingPage.tsx` with live category chips, hardware tag pills, and demo video embed support; verify responsive layout across desktop and mobile.

## 6. Full-Spectrum Color & Visitor Theme Synchronization

- [x] 6.1 Update `RoboticsCanvas3D.tsx` materials, joint pivots, and lighting to Electric Indigo (`#4f46e5`, `#6366f1`), Deep Violet (`#8b5cf6`), and Golden Amber (`#f59e0b`).
- [x] 6.2 Update `TelemetryBar.tsx` styling and badges to Electric Indigo and Golden Amber.
- [x] 6.3 Update `TechTree.tsx` and `ProjectDetailModal.tsx` borders, badges, and accents to Electric Indigo and Golden Amber.
- [x] 6.4 Ensure all visitor sections (Hero, Telemetry ticker, 3D Canvas, Curriculum Tree, BOM Inspector, Committees, Join form, Footer) cleanly adapt to the header Theme Toggle button with zero unreadable text or mismatched dark patches in light mode.

## 7. Universal Guarded Logout Confirmation

- [x] 7.1 Integrate `AdminConfirmModal` into `JSTUHeader.tsx` so clicking logout anywhere triggers a confirmation dialog before terminating the session.
- [x] 7.2 Connect `AdminCMSPanel.tsx` and `AdminLayout.tsx` logout handlers into the shared guarded confirmation system.

## 8. SMTP Account Recovery Email Dispatch

- [x] 8.1 Install `nodemailer` in `uniclub-backend` and implement `uniclub-backend/services/EmailService.js` supporting standard SMTP credentials.
- [x] 8.2 Connect `/api/auth/forgot-password` in `uniclub-backend/routes/jstuRoutes.js` to dispatch authentic HTML recovery emails, returning transparent delivery status.
- [x] 8.3 Wire transparent recovery feedback in `src/pages/AuthPage.tsx` showing exact delivery status, test code if SMTP is unconfigured, and seamless password reset.

## 9. Admin Command Center Overhaul (White Default + Sticky Sidebar)

- [x] 9.1 Set clean, professional white/light theme as the default for `AdminLayout.tsx` and add an explicit Light/Dark Theme Toggle button in the admin command bar.
- [x] 9.2 Make the Admin sidebar sticky (`sticky top-16` / viewport-locked) with its own internal scroll, ensuring it scrolls with the view so the administrator never has to scroll up to click another tab or action.
- [x] 9.3 Remove duplicate horizontal tab buttons underneath "Dynamic Site & System Manager" in `AdminCMSPanel.tsx`, letting the persistent sidebar handle all navigation cleanly.
- [x] 9.4 Ensure all 7 Admin Workspaces render with high-legibility cards, crisp inputs, and full superpower edit authority in both light and dark themes.

## 10. Multi-Model 3D Robotics Explorer & Educational Spec Space

- [x] 10.1 Refactor `RoboticsCanvas3D.tsx` to support 5 switchable procedural 3D models: Autonomous Mobile Rover, 6-Axis Robotic Arm, Arduino Microcontroller Dev Board, Android/Humanoid Bot, and Aerial Drone.
- [x] 10.2 Add live model selector tabs/buttons and wireframe/rotation toggles above or around the 3D canvas.
- [x] 10.3 Implement an interactive Educational Description & Telemetry Space displaying engineering principles, kinematics, computing units, sensor payloads, and student learning notes for each model.

## 11. Turso Cloud SQL Safeguard & Local Build Verification

- [x] 11.1 Verify all database interactions are strictly non-destructive, preserving existing live user settings, schemas, and configurations on Turso Cloud.
- [x] 11.2 Execute frontend build (`npm run build`) and confirm zero TypeScript, ESLint, or CSS bundle errors.
- [x] 11.3 Validate all changes locally without remote git pushing (`git push` strictly avoided).
