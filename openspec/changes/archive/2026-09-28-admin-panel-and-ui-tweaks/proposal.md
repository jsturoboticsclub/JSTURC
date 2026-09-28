# Proposal

## Why

The current admin panel lacks basic branding and content management capabilities, specifically for the site logo and the Curriculum Tech Tree. The password recovery system currently leaks the reset code to the frontend instead of sending a real email via SMTP. Additionally, there is a minor UI glitch in the admin header (double slash) and the 3D model on the landing page is not matching the desired aesthetic and should be replaced with a static HD image. This change addresses these issues to make the site more professional and secure.

## What Changes

- **Admin Branding Management**: Add the ability for administrators to change the site's logo from the admin panel.
- **Admin Tech Tree Management**: Add an interface for administrators to edit the Curriculum Tech Tree content.
- **SMTP Password Recovery**: Configure the backend to send password recovery emails via SMTP instead of leaking the code to the frontend.
- **Admin Header Fix**: Remove the redundant double slash (`//`) in the "JSTU LABS // COMMAND" header path.
- **Landing Page Image**: Replace the `RoboticsCanvas3D` component with a static HD image component.

## Capabilities

### New Capabilities
- `admin/branding`: Allows administrators to update site-wide branding assets, such as the logo.
- `admin/tech-tree`: Allows administrators to edit the Curriculum Tech Tree nodes and content.
- `auth/password-recovery`: Defines the flow for securely recovering a user password via email.
- `landing-page/hero`: Defines the hero section of the landing page, specifically the static HD imagery.

### Modified Capabilities

- None

## Impact

- `uniclub-backend`: Requires configuring `nodemailer` or similar for SMTP, creating/updating endpoints for branding and tech tree.
- `src/components/admin`: New UI components for logo upload and tech tree editing, and fixes to the header.
- `src/components/canvas`: Replaced with an image component.
- `src/pages/AuthPage.tsx`: Minor adjustments if needed for password recovery UI flow.
