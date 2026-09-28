# Design

## Context

The backend uses a dynamic key-value storage pattern in SQLite / Turso via `site_content` (`key`, `section`, `title`, `content`, `meta_json`). Authenticated administrators can submit JSON updates through `PUT /api/admin/site-content`, which immediately become available via `GET /api/site-content`. We will build upon this schema to manage both the multi-item hardware showcase (`key: 'hardware_showcase'`) and the curriculum courses hub (`key: 'curriculum'`) with zero schema migrations required on Turso.

## Goals / Non-Goals

**Goals:**
- Provide an interactive multi-item showcase on the landing page that displays multiple robotics hardware items, accompanied by detailed component breakdowns, "how it works" architectural explanations, documentation links, and embedded demo/video links.
- Create an administrative showcase manager in the admin panel so admins can add, edit, reorder, and remove hardware showcase entries.
- Transform the Curriculum Tech Tree into a member course learning center where members can read syllabi, access study materials, and track course launch statuses.
- Provide administrators with course launch controls (toggling active/upcoming/archived statuses, editing syllabus outlines, adding tutorial and doc links).

**Non-Goals:**
- Creating a full payment gateway or student grading system (out of scope for this club portal).
- Modifying SQL table structures directly (reusing the existing tested `site_content` schema).

## Decisions

### 1. Data Schema for Hardware Showcase (`key: 'hardware_showcase'`)
```json
{
  "items": [
    {
      "id": "hw_autonomous_rover",
      "title": "Aegis-1 Autonomous Ground Rover",
      "category": "Terrestrial SLAM",
      "imageUrl": "/Assets/hero-robot.jpg",
      "summary": "Autonomous search & exploration rover utilizing 360-degree LiDAR and RealSense depth cameras.",
      "howItWorks": "Fuses LiDAR point clouds with wheel odometry and IMU via an Extended Kalman Filter (EKF) to compute centimeter-accurate SLAM in GPS-denied environments.",
      "components": [
        { "name": "Compute", "spec": "NVIDIA Jetson Orin Nano (40 TOPS)" },
        { "name": "LiDAR", "spec": "RPLiDAR S2 (30m range, 32kHz)" },
        { "name": "Motor Drive", "spec": "4x 24V Planetary Gear Brushless BLDC" }
      ],
      "docUrl": "https://github.com/jsturoboticsclub",
      "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
    }
  ]
}
```
*Rationale:* Storing structured items with components and embed links enables rich presentation without hardcoded UI.

### 2. Data Schema for Curriculum Courses (`key: 'curriculum'`)
```json
{
  "courses": [
    {
      "id": "course_ros2_nav",
      "title": "ROS2 Autonomous Navigation & SLAM",
      "track": "autonomous",
      "trackLabel": "Autonomous & ROS2",
      "level": "Intermediate",
      "status": "active",
      "duration": "6 Weeks",
      "instructor": "JSTU Autonomous Systems Lead",
      "summary": "Master Nav2, lifecycle nodes, TF2 transforms, and costmap layers.",
      "syllabus": [
        "Module 1: ROS2 Architecture & DDS Middleware",
        "Module 2: Robot Kinematics & URDF Modeling",
        "Module 3: 2D/3D SLAM with Cartographer & RTAB-Map",
        "Module 4: Path Planning & Costmap Generation with Nav2",
        "Module 5: Hardware-in-the-Loop Simulation"
      ],
      "docUrl": "https://docs.ros.org/en/humble/",
      "videoEmbedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "prerequisites": ["Linux & Bash Basics", "C++ or Python Proficiency"]
    }
  ]
}
```
*Rationale:* Provides a complete learning experience for club members while giving administrators one-click launch power.

### 3. Frontend Architecture
- `HardwareShowcase.tsx`: Embedded in `JSTULandingPage.tsx`, allowing users to cycle through hardware items, view the hardware specs alongside the image, and open an inspection modal.
- `AdminHardwareShowcaseManager.tsx`: A dedicated manager in `AdminCMSPanel.tsx` with dynamic inputs for component lists, doc URLs, and video embed links.
- `AdminTechTreeManager.tsx`: Upgraded with course creation, launch status selectors, and syllabus topic editors.
- `CourseDetailModal.tsx`: An engaging modal where members can read syllabus outlines and open documentation links.

## Risks / Trade-offs

- *[Risk]* Empty or unconfigured state on fresh database instances.
  → *Mitigation*: Bundle curated defaults for both hardware showcase items and curriculum courses so the portal looks comprehensive immediately.
- *[Risk]* Invalid video embed URLs breaking the iframe.
  → *Mitigation*: Validate and sanitize embed URLs (converting regular YouTube watch URLs to embed formats automatically).
