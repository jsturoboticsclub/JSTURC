# Proposal

## Why

The current robotics landing page displays only a single static image without detailed breakdown of hardware subsystems, how they work, or documentation and learning links. Additionally, club members need an interactive, structured course hub where they can read curriculum outlines, access learning materials, and follow courses launched by the club. Administrators require full dynamic control to add and update hardware showcase items and manage/launch active curriculum courses without altering the database directly.

## What Changes

1. **Hardware & Robotics Showcase Section on Landing Page**:
   - Replace the single hero centerpiece image with an interactive multi-item showcase slider / grid.
   - For each showcase item: display the robot/hardware image, title, subsystem breakdown (how it works), hardware specifications, learning documentation links, and interactive/embedded demo or video links.
   - Add a full-screen or expanded inspection view modal for in-depth technical diagrams, component pinouts, and documentation links.

2. **Admin Hardware Showcase CMS Manager**:
   - Create a dedicated admin interface to add, edit, reorder, and delete hardware showcase items.
   - Support image URL or upload, component breakdown bullet points, "how it works" summary, documentation URLs, and embed URLs (e.g. YouTube, CAD web viewer, or GitHub repository).
   - Dynamically persist data through `/api/admin/site-content` with key `hardware_showcase`.

3. **Curriculum Tech Tree & Course Learning Hub**:
   - Elevate the Curriculum Tech Tree into a member course learning center.
   - Members can explore available courses across tracks (Embedded Systems, Autonomous & ROS2, Edge AI & Vision, Mechanical & CAD).
   - Members can click into any course to view full details: curriculum syllabus, lecture outlines, learning materials, prerequisites, instructor/leads, and embedded tutorial links.
   - Courses clearly show their status (e.g. "Active / Enrolling Now", "Upcoming", "Archived").

4. **Admin Course Management & Launch Controls**:
   - Enhance the Admin Tech Tree CMS to include full course management powers.
   - Administrators can add new courses, launch courses (toggle active/enrollment status), edit syllabus topics, attach documentation links and embed tutorial links, and delete or reorder courses.
   - Dynamically persist data through `/api/admin/site-content` with key `curriculum`.

## Capabilities

### New Capabilities
- `admin/hardware-showcase`: Allows administrators to manage multiple hardware showcase items, component breakdowns, documentation links, and embedded preview links.
- `learning/courses`: Enables club members to browse, read, and learn from structured robotics courses with syllabi and learning resources.

### Modified Capabilities
- `landing-page/hero`: Expanded from a single static image to an interactive multi-item hardware showcase with component explanations and documentation links.
- `admin/tech-tree`: Enhanced from simple skill node management to a comprehensive course management system with course launching and syllabus editing powers.

## Impact

- `src/pages/JSTULandingPage.tsx`: Integrated with multi-item hardware showcase and enriched course learning section.
- `src/components/admin/AdminHardwareShowcaseManager.tsx`: New admin manager component for hardware showcase.
- `src/components/admin/AdminTechTreeManager.tsx`: Updated with course creation, syllabus editing, and launch toggles.
- `src/pages/AdminCMSPanel.tsx`: Updated to register the new hardware showcase tab and expanded course controls.
- `src/components/techtree/TechTree.tsx`: Upgraded with course learning modal, syllabus reader, and learning resource launch badges.
