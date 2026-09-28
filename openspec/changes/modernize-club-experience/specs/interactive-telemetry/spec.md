# Spec Delta: interactive-telemetry

## Purpose
Provides real-time laboratory telemetry, operational status indicators, and event countdown trackers to convey live robotics activity and research urgency to club members and visitors.

## ADDED Requirements

### Requirement: Real-Time Laboratory Operational Status
The system SHALL display an interactive laboratory status bar indicating the physical robotics lab's operational mode (e.g., "Active Prototyping", "Autonomous Testing In Progress", "Scheduled Maintenance"), active workspace zone, and current lab safety state.

#### Scenario: Display current lab operational status
- **WHEN** a visitor loads the landing page
- **THEN** the system SHALL display the current operational badge, status indicator dot with pulsing animation, and current lab operating schedule.

### Requirement: Active Robot Telemetry Display
The system SHALL render a dynamic robotics telemetry widget showcasing live or simulated status metrics of current club robotics platforms (such as battery voltage, IMU pitch/roll/yaw, Wi-Fi RSSI, and ROS2 node operational health).

#### Scenario: Viewing robot metrics ticker
- **WHEN** a user navigates to the lab telemetry section or hovers over the active robot selector
- **THEN** the system SHALL stream live-updating telemetry readings with units of measurement and operational thresholds.

### Requirement: Tournament and Workshop Countdown Clock
The system SHALL render synchronized countdown clocks for the club's upcoming robotics tournaments, hackathons, and recruit workshops.

#### Scenario: Upcoming competition countdown
- **WHEN** the club has a scheduled competition date configured
- **THEN** the system SHALL calculate and display the remaining days, hours, minutes, and seconds until launch with urgency state styling.
