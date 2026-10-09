# Spec Delta: admin/hardware-showcase

## ADDED Requirements

### Requirement: Admin can manage hardware inventory counts and loan requests
The system SHALL provide administrative controls within the hardware manager to set total and available physical equipment quantities, inspect active member borrow requests, and mark returned equipment back to available stock.

#### Scenario: Admin updates equipment inventory count
- **WHEN** an authenticated administrator edits a hardware item and updates total quantity to 5
- **THEN** the system updates available stock in the database and updates the member loan availability counter on the showcase
