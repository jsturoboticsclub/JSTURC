# Proposal: Enhanced Member Profile Showcase & Interactive Portfolio Hub

## Why
Currently, member profiles on the JSTU Robotics Club platform only display basic contact information, a plain biography, and simple skills tags. Real-world robotics and engineering clubs, competitive teams, and modern platforms (like GitHub, LinkedIn, Readme/Portfolio sites) allow members to proudly showcase their technical expertise, research domains, verified certifications, honors, competitive builds, and customizable banners. 

By upgrading the member public profile (`/members/:id`) and the self-service editing experience in the Member Dashboard (`/dashboard`), members can build a state-of-the-art roboticist portfolio they can showcase to recruiters, university faculty, and fellow researchers.

## What Changes
- **Interactive Cyber-Themed Profile Hero**: High-tech banner cover area with customizable cyber accents, verified status badges (Executive, Lead, Member, Lab Apprentice), quick copyable share link, and clean typography.
- **Extended Profile Information Architecture**:
  - **Professional Headline**: Short tagline summarizing the member's specialization (e.g., "Autonomous Systems Researcher | Embedded ROS2 & LiDAR Prototyping").
  - **Research & Engineering Focus Tracks**: Interactive domain tags (e.g., SLAM & Autonomy, Biomimetics, Power Electronics, Computer Vision).
  - **Honors, Awards & Certifications Showcase**: Structured list of member achievements (contest wins, hackathon awards, academic honors, professional credentials) with dates and verifications.
  - **Showcased / Featured Projects & Repositories**: Visual project cards showing lab roles, tech stacks, live links, and GitHub repositories directly on the member's profile.
  - **Expanded Social & Scholarly Links**: Added support for Google Scholar, ResearchGate, Twitter/X, Discord, personal portfolio, alongside GitHub, LinkedIn, and Email.
- **Enhanced Member Dashboard Self-Service Area**:
  - An intuitive, tabbed or categorized profile customizer where members can live-preview and manage their headline, research tracks, achievements, external scholarly links, and bio.
- **Backend Persistence & Committee Synchronization**:
  - Extended API endpoints (`PUT /api/member/profile`, `GET /api/members/:id`, `GET /api/member/dashboard`) supporting the rich profile schema, persisting in the SQLite/Turso database with backward compatibility and zero data disruption.

## Capabilities

### New Capabilities
- `member/profile-showcase`: Covers the rich member profile presentation (`MemberDetailPage`), public sharing, interactive research/award sections, and the self-service editing hub in `MemberDashboard`.

### Modified Capabilities
<!-- No modified capability requirement changes on existing specs -->

## Impact
- **Frontend Pages**:
  - `src/pages/MemberDetailPage.tsx`: Overhauled layout, cyber hero cover, research tracks, achievements grid, project showcase, and share dialog.
  - `src/pages/MemberDashboard.tsx`: Added form fields and interactive editors for headline, research tracks, achievements, and scholarly social links.
- **Backend Routes & DB**:
  - `uniclub-backend/db.js`: Added schema migration for `headline`, `research_interests`, and `achievements` columns on `users`.
  - `uniclub-backend/routes/jstuRoutes.js`: Updated member profile retrieval (`/api/members/:id`), dashboard data (`/api/member/dashboard`), and profile update route (`PUT /api/member/profile`).
- **Dependencies**: Uses existing Lucide icons, Tailwind CSS, and Framer Motion / CSS transitions without requiring bulky new third-party dependencies.
