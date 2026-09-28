# Spec Delta: curriculum-tech-tree

## Purpose
Provides an interactive, gamified visual tech tree and skill progression matrix illustrating the multidisciplinary learning path of club engineers and linking competencies directly to active club projects.

## ADDED Requirements

### Requirement: Interactive Node-Based Learning Progression
The system SHALL present an interactive graphical curriculum tree categorized into primary robotics sub-disciplines: Embedded Systems, Autonomous Robotics/ROS, Mechanical Design/CAD, and Edge AI/Computer Vision.

#### Scenario: Exploring robotics skill tree nodes
- **WHEN** a student clicks or taps on a curriculum node (e.g., "STM32 & RTOS" or "SLAM & LiDAR")
- **THEN** the system SHALL display a detailed flyout card showing prerequisite knowledge, recommended lab equipment, recommended tutorials, and mastery level badges.

### Requirement: Sub-Discipline Track Filtering
The system SHALL enable users to filter or highlight specific learning tracks according to their interest or engineering specialization.

#### Scenario: Filtering by engineering domain
- **WHEN** a user selects the "Autonomous & ROS2" filter tab
- **THEN** the system SHALL focus and highlight the autonomous robotics path while dimming unconnected nodes to guide the learning path.

### Requirement: Active Project Competency Linkage
The system SHALL link curriculum nodes to active club projects where that skill is actively employed.

#### Scenario: Navigating from skill node to active projects
- **WHEN** a user views a skill node with associated ongoing club projects
- **THEN** the system SHALL display direct navigation links to view the corresponding project profiles in the club showcase.
