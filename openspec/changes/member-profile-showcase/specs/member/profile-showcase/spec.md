# Spec Delta: Member Profile Showcase & Interactive Portfolio Hub

## Purpose
Provides an interactive and comprehensive showcase for roboticist club members, featuring specialized technical credentials, research focus areas, honors, and self-service customization tools.

## ADDED Requirements

### Requirement: Interactive Cyber Member Profile Presentation
The system SHALL display an upgraded public profile view at `/members/:id` featuring a cyber-themed hero card, member avatar, dynamic rank badges, professional headline, contact links, and verified committee tenure history.

#### Scenario: Viewing a complete member profile
- **WHEN** a visitor navigates to `/members/:id` for an approved member
- **THEN** the system displays the member's photo, name, headline, department, student ID, bio, research tracks, achievements, and project contributions in an interactive layout

#### Scenario: Member with missing optional fields
- **WHEN** a member profile is rendered without headline, achievements, or research tracks
- **THEN** the system gracefully renders fallback placeholders without layout breaking or console errors

### Requirement: Research Focus & Technical Tracks Display
The system SHALL present structured research and technical domains for each member, distinguishing specialized engineering fields (such as Autonomous Navigation, Embedded Firmware, Computer Vision, CAD & Mechanical Design).

#### Scenario: Displaying research interests
- **WHEN** viewing a member who has declared research interests
- **THEN** the system renders interactive badges representing each domain with relevant iconography

### Requirement: Honors, Awards & Certifications Showcase
The system SHALL present a structured honors and certifications section highlighting competitive awards, hackathon rankings, and credentials achieved by the member.

#### Scenario: Member has awards recorded
- **WHEN** a member profile containing achievements is viewed
- **THEN** the system displays each achievement item with its title, year, issuing body or competition, and external link if provided

### Requirement: Social and Scholarly Links Integration
The system SHALL support extended social and scholarly links including GitHub, LinkedIn, Google Scholar, ResearchGate, personal portfolio, and Twitter/X.

#### Scenario: Clicking scholarly or social links
- **WHEN** a user clicks any available social or academic link icon on a member's profile
- **THEN** the external profile opens safely in a new browser tab with `rel="noreferrer"`

### Requirement: Member Dashboard Profile Customizer
The system SHALL allow authenticated members to manage and update their extended portfolio information (headline, research tracks, achievements, social and academic links, bio, and avatar) from `/dashboard`.

#### Scenario: Member saves extended profile details
- **WHEN** an authenticated member submits updated headline, research domains, awards, and links in the dashboard
- **THEN** the system persists changes via `PUT /api/member/profile`, updates the local session, and reflects the changes immediately on `/members/:id`

### Requirement: One-Click Share & Public Portfolio Link
The system SHALL provide a "Share Profile" button on the member page that copies the direct profile URL to clipboard and triggers a brief visual confirmation toast.

#### Scenario: Member or visitor clicks share profile
- **WHEN** the user clicks "Share Profile" on `/members/:id`
- **THEN** the system copies the absolute URL to clipboard and displays a "Link Copied" confirmation badge
