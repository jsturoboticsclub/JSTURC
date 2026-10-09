# Design: Member Profile Showcase & Interactive Portfolio Hub

## Context
See `proposal.md` for background and user goals.
Currently, member profiles are fetched through `GET /api/members/:id`, where `users` table fields (`name`, `bio`, `skills`, `profile_photo`, `contact_links`, `department`, `student_id`, `project_contributions`) are mapped alongside `committee_members` tenure history.
Members edit their profile via `PUT /api/member/profile` on `/dashboard`.
To support modern, portfolio-level profiles, we need to extend this architecture with structured fields for headlines, research domains, honors/awards, and expanded social links without breaking existing accounts.

## Goals / Non-Goals

**Goals:**
- Provide a responsive cyber-themed visual profile with a cover banner, status badges, and clear hierarchy.
- Add structured fields for Headline, Research Focus Tracks, and Achievements / Awards.
- Expand social and scholarly links (GitHub, LinkedIn, Google Scholar, ResearchGate, Website, Twitter/X).
- Implement a user-friendly editor in `/dashboard` so members can easily update all these showcase sections.
- Ensure 100% backward compatibility with existing users and synchronization with `committee_members`.
- Add a convenient "Share Profile" button that copies the clean profile URL.

**Non-Goals:**
- Third-party OAuth sync for GitHub repositories or Google Scholar citations (data is member-entered and validated).
- File upload for certificates (members can provide verification URLs or descriptions).

## Decisions

### 1. Database Schema Extension Strategy
- **Decision**: Add `headline TEXT`, `research_interests TEXT`, and `achievements TEXT` columns to the `users` table via `ALTER TABLE ... ADD COLUMN` inside `initDatabase()` in `uniclub-backend/db.js`.
- **Rationale**: SQLite supports safe `ALTER TABLE ADD COLUMN` with `try/catch` wrappers (already the established pattern in this repo for `submitted_by_name`, `committee_category`, etc.). This preserves existing records with zero downtime.
- **Alternatives Considered**:
  - *New separate `member_profiles` table*: Adds unnecessary SQL JOIN complexity and potential out-of-sync risks.
  - *Embedding everything into existing `contact_links` or `bio`*: Makes querying, editing, and typing brittle and harder to validate.

### 2. UI/UX Layout Architecture for Member Detail Page
- **Decision**: A modern, high-tech two-column layout on desktop (or hero banner + tabbed/stacked sections):
  - **Top Hero Header**: Cyber gradient banner, large framed avatar with glowing border, online/active badge, member name, prominent headline, department, student ID pill, and social links bar.
  - **Left / Secondary Column**: Quick stats & facts (Committees served, Years active, Department, Contact info, Quick Share action).
  - **Main Content Column**:
    1. *Roboticist Biography* (rich formatted typography).
    2. *Research & Engineering Focus Tracks* (interactive badges with cyber styling).
    3. *Technical & Engineering Stack* (skills chips).
    4. *Honors, Awards & Certifications* (timeline or card-based highlight with trophy icon, year, issuer, description).
    5. *Project Contributions & Builds* (linked build cards).
    6. *Committee Tenures Served* (historical session milestones).
- **Rationale**: Follows standard modern portfolio designs (e.g. GitHub profile / modern developer portfolios) while retaining the robotics club identity.
- **Alternatives Considered**:
  - *Single column vertical stream*: Leads to excessive scrolling on desktop with wasted whitespace.

### 3. Dashboard Profile Customizer Workflow
- **Decision**: Structure the edit section in `MemberDashboard.tsx` with clear cards/collapsible panels:
  - Basic Bio & Identity (Name, Headline, Department, Student ID, Avatar).
  - Research Tracks (quick tag chips + add input).
  - Technical Skills (tag chips + add input).
  - Awards & Honors (interactive add/remove list for itemized achievements).
  - Social & Academic Links (inputs for GitHub, LinkedIn, Google Scholar, ResearchGate, Portfolio, Twitter/X).
- **Rationale**: Makes editing complex profile data approachable without overwhelming the member with a giant unorganized form.

## Risks / Trade-offs

- **[Risk: Legacy users have null values for new fields]** → *Mitigation*: Frontend components perform defensive fallbacks (`member.research_interests || []`, `member.achievements || []`) so legacy accounts render cleanly without empty error blocks.
- **[Risk: Database schema mismatch in cloud Turso vs local SQLite]** → *Mitigation*: Column addition uses `try { await runQuery('ALTER TABLE users ADD COLUMN ...'); } catch (e) {}` which executes safely on both local SQLite and Turso cloud databases.
- **[Risk: Extremely long achievement or research strings]** → *Mitigation*: Apply character limits and clean text wrapping in UI components.

## Migration Plan
1. Add columns in `uniclub-backend/db.js` `initDatabase()`.
2. Update `uniclub-backend/routes/jstuRoutes.js` (`/api/members/:id`, `/api/member/dashboard`, `PUT /api/member/profile`).
3. Update `src/pages/MemberDashboard.tsx` with enhanced form state and validation.
4. Update `src/pages/MemberDetailPage.tsx` with new interactive cyber presentation and share link helper.
