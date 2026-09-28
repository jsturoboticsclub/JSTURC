# Spec Delta: immersive-robotics-ui

## Purpose
Provides high-impact robotic visual aesthetics, interactive 3D hardware components, cybernetic UI accents, and comprehensive project modal showcases that reflect a top-tier robotics institution.

## ADDED Requirements

### Requirement: Interactive Multi-Model 3D Robotics Explorer
The system SHALL render an interactive 3D robotics explorer in the hero or showcase section featuring a live model selector supporting multiple robotics hardware configurations:
1. *Autonomous Mobile Rover* (chassis, 4 all-terrain wheels, lidar scanning mast, ultrasonic telemetry)
2. *Articulated 6-Axis Robotic Arm* (multi-joint manipulator with two-finger pneumatic gripper)
3. *Arduino Microcontroller Dev Board* (ATmega328P chip, dual GPIO headers, crystal oscillator, USB interface, status LEDs)
4. *Bipedal Android / Humanoid Bot* (servo torso, stereoscopic sensor head, articulated walking limbs)
5. *Aerial Drone / Quadcopter* (carbon fiber cross-frame, 4 high-speed rotors, central flight controller, camera gimbal)

#### Scenario: Switching 3D robotics models
- **WHEN** a user selects a model from the 3D explorer selector tabs
- **THEN** the system SHALL dynamically mount and render the selected 3D model with smooth physics damping, cursor interaction, and wireframe toggle capability.

### Requirement: Interactive Educational Telemetry and Specification Space
The system SHALL provide an interactive educational specification space alongside the 3D canvas displaying technical details, sensor payloads, kinematics principles, and real-world student club applications for the currently selected model.

#### Scenario: Learning robotics principles from the 3D showcase
- **WHEN** a visitor inspects the active 3D model
- **THEN** the system SHALL display the model's educational description, degrees of freedom, computational hardware, operating voltage, and real-world club tournament applications.

### Requirement: Full Visitor & Landing Page Theme Synchronization
The system SHALL ensure that all visitor and landing page sections (Hero, Telemetry ticker, 3D Explorer, Agenda research pillars, Projects & BOM inspector, Tech tree, Committee rosters, Join form, and Footer) fully and harmoniously synchronize with the global light/dark theme toggle button.

#### Scenario: Toggling between light and dark themes on the public site
- **WHEN** a visitor clicks the theme toggle button in the header
- **THEN** all sections across the landing page SHALL seamlessly adapt their backgrounds (`bg-white`/`bg-slate-50` in light mode, `bg-[#070B14]` in dark mode), card surfaces, text contrast, borders, and cybernetic accents with zero unreadable text or mismatched dark patches.

### Requirement: Cybernetic Grid and Neon HUD Design Accents
The system SHALL incorporate a cohesive robotics aesthetic featuring subtle animated circuit grid patterns, neon accent indicators, and futuristic HUD-inspired status typography.

#### Scenario: Viewing hero and section headers
- **WHEN** a user scrolls through the platform
- **THEN** the system SHALL render consistent cybernetic styling, neon glowing boundary accents, and smooth hover micro-interactions across interactive cards and action buttons.

### Requirement: Rich Project Showcase Modals with Hardware Specs
The system SHALL provide an expanded interactive modal when viewing featured club projects, containing technical specifications, hardware Bill of Materials (BOM), CAD snapshots, and repository statistics.

#### Scenario: Opening project technical deep-dive
- **WHEN** a user clicks "Inspect Architecture" or "Project Details" on any project card
- **THEN** the system SHALL present an animated modal dialog containing hardware breakdown, microcontroller architecture, system architecture diagrams, and links to source schematics.

### Requirement: Harmonized High-Tech Visual System
The system SHALL employ a unified high-tech color system across the 3D canvas, live telemetry ticker, curriculum tech tree, and project BOM modals, using Electric Indigo (`#4f46e5`, `#6366f1`) and Deep Violet (`#8b5cf6`) as primary accents, paired with Warm Golden Amber (`#f59e0b`) for active telemetry and urgency states, eliminating disconnected color schemes.

#### Scenario: Visual cohesion across new components
- **WHEN** a user navigates between the hero 3D canvas, telemetry ticker, tech tree, and project BOM modals
- **THEN** all components SHALL display consistent Indigo, Purple, and Amber styling matching the rest of the club platform.

