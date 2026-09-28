# Tasks

## 1. Hardware Showcase Core & Landing Page Component

- [x] 1.1 Create `src/components/showcase/HardwareShowcase.tsx` and `HardwareDetailModal.tsx` displaying multiple hardware items with images, component breakdown, "how it works", and documentation/embed links, verifying rendering in browser.
- [x] 1.2 Embed the multi-item hardware showcase component into `src/pages/JSTULandingPage.tsx` replacing the single hero centerpiece, verifying responsive presentation on desktop and mobile.

## 2. Admin Hardware Showcase Management

- [x] 2.1 Create `src/components/admin/AdminHardwareShowcaseManager.tsx` with full CRUD for hardware showcase items (title, category, image URL, component list, how it works, doc URL, video/embed URL) saving to `/api/admin/site-content` with key `hardware_showcase`.
- [x] 2.2 Add the "Hardware Showcase" tab to `src/pages/AdminCMSPanel.tsx` and `AdminLayout.tsx`, verifying administrators can add, edit, and reorder hardware items.

## 3. Curriculum Courses Learning Hub

- [x] 3.1 Upgrade `src/components/techtree/TechTree.tsx` to support structured member courses with syllabus topics, duration, difficulty level, and launch status (Active, Upcoming, Archived).
- [x] 3.2 Create `src/components/techtree/CourseDetailModal.tsx` allowing members to inspect full syllabus outlines, read lecture topics, and open external documentation and video tutorials.

## 4. Admin Course Launch Controls & Verification

- [x] 4.1 Update `src/components/admin/AdminTechTreeManager.tsx` to allow administrators to add new courses, launch/archive courses (status toggle), edit syllabus items, and configure documentation and video embed links.
- [x] 4.2 Test saving both hardware showcase and curriculum courses in the admin panel and verify real-time updates on the live landing page.
