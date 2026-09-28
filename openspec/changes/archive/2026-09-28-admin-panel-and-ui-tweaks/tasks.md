# Tasks

## 1. Backend Updates (SMTP)

- [x] 1.1 Configure `nodemailer` in `uniclub-backend` to handle SMTP password recovery emails and verify by triggering a test recovery flow.
- [x] 1.2 Remove any residual code that leaks the reset code in the HTTP response and verify via manual API testing.

## 2. Admin UI Fixes & Branding

- [x] 2.1 Fix the double slash issue in the "JSTU LABS // COMMAND" header and verify the layout looks correct.
- [x] 2.2 Add logo upload / URL specification UI in `AdminCMSPanel.tsx` or `AdminLayout.tsx` and verify the new logo renders correctly in the admin header.

## 3. Curriculum Tech Tree Management

- [x] 3.1 Implement a new section in the Admin UI for editing the Curriculum Tech Tree nodes and verify it correctly updates the `/api/site-content` (or equivalent backend state).
- [x] 3.2 Ensure the main `TechTree.tsx` component correctly pulls from the dynamically edited content and verify rendering on the frontend.

## 4. Landing Page Image

- [x] 4.1 Remove `RoboticsCanvas3D` from the hero section on the landing page and verify the 3D model no longer loads.
- [x] 4.2 Replace the 3D canvas with a high-quality static HD image component and verify responsive behavior on different screen sizes.
