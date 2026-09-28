# Proposal: Modernize Robotics Club Digital Experience

## Why
The JSTU Robotics Club digital platform currently has functional foundations (committees, CMS, projects, Turso cloud database, and Cloudinary storage). However, the public-facing user interface feels static and standard rather than embodying the cutting-edge, high-tech identity of a premier university robotics research lab. Modernizing the platform with interactive 3D hardware elements, live laboratory telemetry, an interactive robotics curriculum tech tree, and enhanced visual dynamics will elevate the club's prestige, drive prospective student engagement, and impress sponsors and tournament partners.

## What Changes
- **Live Laboratory Telemetry & Status Bar**: Real-time status ticker broadcasting active bots in testing, lab occupancy/operational status, and tournament countdown clocks.
- **Interactive 3D Multi-Model Robotics Explorer**: Replace the single robotic arm with an interactive 3D model showcase supporting multiple robotics hardware models (Autonomous Mobile Rover, 6-Axis Robotic Arm, Arduino Microcontroller Board, Android/Humanoid Bot, Aerial Drone) paired with an educational description and telemetry panel for student learning.
- **Full Theme Harmony Across Visitor & Landing Pages**: Ensure all visitor sections (Hero, Telemetry, 3D Showcase, Agenda, Projects/BOM, Tech Tree, Committee Directory, Join Form, Footer) respond synchronously to the theme toggle button with zero mismatched blocks or unreadable text in both light and dark modes.
- **Professional Admin Command Center (White Default + Sticky Sidebar)**: Refactor the admin panel into a clean white/light theme by default with a dedicated Light/Dark toggle button, a fixed/sticky sidebar that stays locked in viewport during scrolling so admins never have to scroll back up, and remove redundant duplicate tab buttons under "Dynamic Site & System Manager".
- **Strict Turso Cloud SQL & Live Data Safeguard**: Maintain zero destructive operations against live Turso Cloud SQLite data and existing admin configurations.
- **Complete End-to-End SMTP Password Recovery**: Ensure real transactional email dispatch for password recovery codes with transparent fallback and complete verification flow.

## Capabilities

### New Capabilities
- `interactive-telemetry`: Real-time status ticker, lab operational metrics, and event countdown timers with golden amber telemetry accents.
- `curriculum-tech-tree`: Interactive visual robotics skill tree and learning path with project linkage.
- `immersive-robotics-ui`: Interactive 3D robot canvas, harmonized electric indigo & purple cybernetic visual accents, and rich project showcase modals.
- `admin-portal-modernization`: Professional, modular command-center interface for administrators to manage landing page content, committee rosters, users, roles, projects, and announcements with universal guarded logout, mutation warnings, and SMTP password recovery.

### Modified Capabilities
<!-- None: This is the first OpenSpec specification in the project -->

## Impact
- **Frontend Code**: `src/pages/JSTULandingPage.tsx`, `src/pages/AdminCMSPanel.tsx`, `src/components/JSTUHeader.tsx`, `src/components/admin/AdminLayout.tsx`, `src/components/admin/AdminConfirmModal.tsx`, `src/components/canvas/RoboticsCanvas3D.tsx`, `src/components/telemetry/TelemetryBar.tsx`, `src/components/techtree/TechTree.tsx`, `src/components/projects/ProjectDetailModal.tsx`.
- **Dependencies**: Three.js, Lucide icons, `nodemailer` in backend.
- **Backend/API**: `uniclub-backend/services/EmailService.js`, `uniclub-backend/routes/jstuRoutes.js` (SMTP email integration and forgot-password endpoint upgrade).


