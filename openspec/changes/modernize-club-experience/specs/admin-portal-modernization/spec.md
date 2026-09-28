# Spec Delta: admin-portal-modernization

## Purpose
Provides an intuitive, professional, and modular command-center interface empowering club administrators to seamlessly configure site content, manage committee rosters, verify members, and oversee club projects with live feedback.

## ADDED Requirements

### Requirement: Command Center Layout and Ergonomic Navigation
The system SHALL provide a modern command-center layout featuring a clean, professional white/light theme by default, a dedicated Light/Dark theme toggle button in the command header, a fixed sticky sidebar that remains locked in viewport during page scrolling, and system health status indicators.

#### Scenario: Navigating between administrative modules
- **WHEN** an administrator clicks a section in the sidebar (e.g., "Committees" or "Landing CMS")
- **THEN** the system SHALL switch workspaces instantly without full page reloads, updating the URL query parameters to preserve the active view on refresh.

#### Scenario: Scrolling down long administrative tables
- **WHEN** an administrator scrolls down long user tables, committee rosters, or project lists
- **THEN** the sidebar navigation SHALL remain anchored and visible in viewport so the administrator can switch tabs or execute navigation without scrolling back to the top of the page.

#### Scenario: Toggling between white and dark theme in admin panel
- **WHEN** an administrator clicks the Theme Toggle button in the admin command bar
- **THEN** the admin interface SHALL transition cleanly between high-legibility light theme (white surfaces, clean borders, crisp typography) and sleek dark command-center theme.

### Requirement: De-duplicated Workspace Navigation
The system SHALL remove redundant horizontal tab buttons underneath "Dynamic Site & System Manager", routing all workspace switching exclusively through the ergonomic sidebar.

#### Scenario: Viewing the admin workspace header
- **WHEN** an administrator accesses the admin panel
- **THEN** the interface SHALL render a clean header without duplicated tab buttons cluttering the view beneath "Dynamic Site & System Manager".

### Requirement: Strict Turso Cloud Database Zero-Destruction Guarantee
The system SHALL strictly safeguard all live data on Turso Cloud SQLite, guaranteeing zero overwriting, table dropping, or deletion of existing user accounts and admin settings.

#### Scenario: Running database queries and updates
- **WHEN** the backend processes user authentication, password resets, or CMS mutations
- **THEN** all SQL operations SHALL execute non-destructively against existing tables, preserving all live user accounts and administrator configurations.

### Requirement: Modular CMS Workspaces
The system SHALL decompose administrative tasks into isolated, dedicated workspaces for:
1. Site Content & Hero Configuration
2. Committee & Executive Board Roster Management
3. User Verification & Role Assignments
4. Project Moderation & Featured Toggles
5. Announcements & Event Schedules

#### Scenario: Filtering and searching records in a workspace
- **WHEN** an administrator enters search text or filters by category in any workspace table
- **THEN** the system SHALL filter table records in real time without lag and display matching count statistics.

### Requirement: Live Preview and Inline Content Modification
The system SHALL provide inline editing and live preview capabilities for landing page text passages, hero titles, committee designations, and operational telemetry toggles.

#### Scenario: Editing landing page text
- **WHEN** an administrator modifies a text field or toggle in the CMS workspace and clicks "Save Changes"
- **THEN** the system SHALL persist the changes to the cloud database, display an affirmative toast notification, and provide a direct "View Live Site" preview link.

#### Scenario: Unsaved changes protection
- **WHEN** an administrator attempts to navigate away with uncommitted edits in an active form
- **THEN** the system SHALL warn the administrator and request confirmation before discarding modifications.

### Requirement: Resilient Authentication and Session State
The system SHALL maintain consistent session state across navigation, provide clear descriptive error alerts for failed network requests, and prevent accidental session invalidation or unexpected logouts.

#### Scenario: Session persistence during administration
- **WHEN** an administrator refreshes the browser or opens direct tab links
- **THEN** the system SHALL validate the current session token from local storage, restore the active workspace tab, and retain authenticated administrative privileges.

### Requirement: Guarded Logout Confirmation Dialog
The system SHALL require explicit user confirmation via a modal dialog before terminating an active administrator session, preventing accidental logouts.

#### Scenario: Administrator initiates session logout
- **WHEN** an administrator clicks "Logout" from the sidebar, profile menu, or header
- **THEN** the system SHALL display a confirmation modal with clear "Cancel" and "Confirm Logout" options, and SHALL only clear credentials and redirect to login if the administrator explicitly confirms.

### Requirement: Warning and Confirmation for Administrative Mutations
The system SHALL display an explicit warning confirmation modal before applying modifications to user profiles, role elevations, committee designations, project statuses, or critical site configurations.

#### Scenario: Modifying a user profile or privilege level
- **WHEN** an administrator attempts to change a user's role (e.g., promoting to Admin or Executive), modify user profile details, or change verification status
- **THEN** the system SHALL present a warning modal summarizing the exact changes about to occur and requiring explicit confirmation before committing the mutation to the database.

#### Scenario: Deleting or deactivating records
- **WHEN** an administrator clicks to delete a project, committee member, or announcement
- **THEN** the system SHALL show a high-visibility danger confirmation dialog detailing the irreversible nature of the action and requiring positive acknowledgment.

### Requirement: Full-Spectrum Superpower Administrative Authority
The system SHALL provide administrators with absolute authority and dedicated UI controls to modify any live entity on the website, including hero titles, landing page passages, committee rosters, member roles, project submissions, and telemetry parameters without requiring code edits or redeployments.

#### Scenario: Live updates from admin panel
- **WHEN** an administrator updates any text passage, section toggle, or committee tenure in the admin panel
- **THEN** the system SHALL persist the mutation to the Turso cloud database and immediately reflect the change on the public landing page.

### Requirement: Real SMTP Password Recovery Email Dispatch
The system SHALL dispatch real transactional password recovery emails containing the 6-digit verification code using configured SMTP transport parameters, providing transparent feedback if email delivery succeeds or fails.

#### Scenario: Requesting password reset email
- **WHEN** a user enters their registered email on the recovery screen
- **THEN** the system SHALL dispatch an authentic HTML email containing the reset code to the recipient address and confirm delivery to the user interface.


