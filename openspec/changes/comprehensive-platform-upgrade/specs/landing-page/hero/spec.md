# Spec Delta: landing-page/hero

## ADDED Requirements

### Requirement: Mobile touch gesture isolation
The system SHALL ensure the hero interactive elements and 3D canvas do not intercept or hijack vertical swipe gestures on mobile viewports, allowing natural page scrolling across all screen sizes.

#### Scenario: Mobile user scrolls through hero section
- **WHEN** a user on a touchscreen mobile device swipes vertically over the hero area
- **THEN** the browser smoothly scrolls the landing page vertically without camera rotation traps or touch-action locks
