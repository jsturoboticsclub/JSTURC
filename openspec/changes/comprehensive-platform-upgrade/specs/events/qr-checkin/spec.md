# Spec Delta: events/qr-checkin

## Purpose
Generates scannable digital admission credentials for event RSVPs and enables event coordinators to instantly verify attendee check-ins during live club workshops and competitions.

## ADDED Requirements

### Requirement: Digital event ticket pass generation
The system SHALL generate a unique digital admission token and QR code for every authenticated member who RSVPs to an active club event or workshop.

#### Scenario: Member views RSVP ticket
- **WHEN** a registered member visits an event detail page where they hold a confirmed RSVP
- **THEN** the system displays a digital event badge with member name, event details, and a dynamic QR code verification token

### Requirement: Event coordinator attendance verification
The system SHALL provide event staff with an attendance verification scanner/lookup endpoint that validates the ticket token and marks the attendee as checked in.

#### Scenario: Staff scans attendee QR ticket
- **WHEN** an event coordinator scans an attendee's QR pass or submits their admission token
- **THEN** the system verifies the token's authenticity, checks against the event roster, records check-in timestamp, and prevents duplicate re-entry
