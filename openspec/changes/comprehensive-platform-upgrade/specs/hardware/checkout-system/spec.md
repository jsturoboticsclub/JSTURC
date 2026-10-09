# Spec Delta: hardware/checkout-system

## Purpose
Enables club members to request physical lab hardware loans and allows lab managers to review, approve, track return schedules, and manage equipment inventory.

## ADDED Requirements

### Requirement: Member can request hardware loan
The system SHALL provide an authenticated member interface to submit a loan requisition for available hardware components with purpose, requested duration, and project name.

#### Scenario: Submitting a loan request
- **WHEN** an authenticated member clicks "Request to Borrow" on an available hardware item, selects a loan period up to 30 days, provides project details, and submits
- **THEN** a new loan application is created with status "pending_approval" and the member receives a confirmation notice

### Requirement: Lab manager approves or rejects loan
The system SHALL allow designated administrators and lab managers to inspect pending hardware requisitions, approve with assigned asset serials, or reject with explanatory feedback.

#### Scenario: Approving loan requisition
- **WHEN** an administrator clicks "Approve Loan" on a pending requisition
- **THEN** the hardware available quantity is decremented by the requested amount, the status transitions to "active", and an expected return timestamp is recorded
