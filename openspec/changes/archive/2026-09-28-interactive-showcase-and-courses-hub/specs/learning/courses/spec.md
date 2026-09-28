# Spec Delta

## Purpose

Provides robotics club members with an interactive course syllabus and learning hub where they can explore, study, and follow courses launched by the club.

## ADDED Requirements

### Requirement: Members can view course catalog and curriculum
The system SHALL display an interactive robotics curriculum catalog grouping courses by discipline (Embedded Systems, Autonomous & ROS2, Mechanical & CAD, Edge AI & Vision) with current status indicators (e.g., Active / Enrolling, Upcoming, Archived).

#### Scenario: Member explores course list
- **WHEN** a user visits the curriculum section on the portal
- **THEN** the system displays all available courses with difficulty levels, discipline badges, and launch status

### Requirement: Members can read course syllabus and learning materials
The system SHALL allow users to open any course to view detailed syllabus topics, hardware requirements, learning objectives, documentation links, and embedded tutorial resources.

#### Scenario: Member inspects course details
- **WHEN** a user selects a course from the curriculum hub
- **THEN** an interactive modal or view displays the course overview, syllabus modules, documentation links, and embedded tutorial materials
