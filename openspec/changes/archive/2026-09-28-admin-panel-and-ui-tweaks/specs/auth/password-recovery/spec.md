# Spec Delta

## Purpose

Defines the flow for securely recovering a user password via email using SMTP.

## ADDED Requirements

### Requirement: SMTP password recovery email
The system SHALL send a secure password recovery code to the user's email via SMTP instead of leaking it in API responses.

#### Scenario: Request password recovery
- **WHEN** user requests password recovery for a valid email address
- **THEN** the system sends an email with the recovery code via SMTP
- **AND** the UI does not display the recovery code directly
