# Tasks: Member Profile Showcase & Interactive Portfolio Hub

## 1. Backend Schema & API Extension

- [x] 1.1 Add schema migrations in `uniclub-backend/db.js` for `headline`, `research_interests`, `achievements`, and `cover_photo` columns on `users`, and verify with backend startup log.
- [x] 1.2 Update `GET /api/members/:id` in `uniclub-backend/routes/jstuRoutes.js` to parse and return `headline`, `research_interests`, `achievements`, `cover_photo`, and extended `contact_links`, verifying with API response.
- [x] 1.3 Update `PUT /api/member/profile` in `uniclub-backend/routes/jstuRoutes.js` to validate and persist the new fields, synchronizing with `committee_members`, and verify with automated curl test.
- [x] 1.4 Update `GET /api/member/dashboard` in `uniclub-backend/routes/jstuRoutes.js` to return all extended profile fields for the authenticated member, verifying test response.

## 2. Member Dashboard Profile Customizer

- [x] 2.1 Update `formData` state and validation in `src/pages/MemberDashboard.tsx` to include `headline`, `research_interests`, `achievements`, and expanded `contact_links` (Google Scholar, ResearchGate, Twitter/X, Website), verifying initial state loads without warnings.
- [x] 2.2 Build an interactive Research Focus Tracks manager in `MemberDashboard.tsx` allowing members to add/remove technical domain tags with suggestions (e.g., ROS2, SLAM, Embedded IoT, Computer Vision, CAD), and verify adding/removing tags works smoothly.
- [x] 2.3 Build an Honors, Awards & Certifications manager in `MemberDashboard.tsx` allowing members to add structured achievement items (Title, Year, Issuer/Event, Link), and verify entries can be added, edited, or removed.
- [x] 2.4 Extend the Social & Academic Links input group in `MemberDashboard.tsx` for GitHub, LinkedIn, Google Scholar, ResearchGate, Website, and Twitter/X, and verify all link inputs update state.
- [x] 2.5 Connect profile form submission in `MemberDashboard.tsx` to `PUT /api/member/profile`, update local storage, and verify successful save notification with updated state.

## 3. Interactive Cyber Profile Presentation (`MemberDetailPage.tsx`)

- [x] 3.1 Redesign the profile hero banner in `src/pages/MemberDetailPage.tsx` with a cyber aesthetic cover, high-resolution framed avatar with glowing border, verified role pill, active/alumni badge, student ID pill, and prominent professional headline.
- [x] 3.2 Implement the expanded Social & Scholarly Links bar in `MemberDetailPage.tsx` with icons for GitHub, LinkedIn, Google Scholar, ResearchGate, Website, and Twitter/X, verifying external links open safely in a new tab.
- [x] 3.3 Create the Research Focus & Technical Domains section in `MemberDetailPage.tsx` with high-contrast cyber chips and domain icons, verifying proper rendering and empty state fallback.
- [x] 3.4 Create the Honors, Awards & Certifications showcase card in `MemberDetailPage.tsx` displaying timeline/cards with award icons, issuing dates, and external verification links.
- [x] 3.5 Implement the "Share Profile" button in `MemberDetailPage.tsx` that copies the clean public URL to the user's clipboard and displays a sleek animated confirmation toast.
- [x] 3.6 Ensure full responsiveness across mobile, tablet, and widescreen desktop with dark/light mode compatibility, verifying with browser inspection.

## 4. End-to-End Verification & Build Check

- [x] 4.1 Run frontend production build (`npm run build`) and backend syntax verification to ensure zero lint or TypeScript errors.
- [x] 4.2 Verify public member profile view at `/members/:id` with real mock data and verify dashboard edit-save round-trip in browser.

