# Design

## Context

The current application lacks some necessary UI controls in the admin dashboard (e.g., logo upload and tech tree editing). Additionally, the password recovery flow is insecure as it leaks the reset code to the frontend instead of emailing it. Lastly, the landing page features a WebGL 3D model that does not align with the desired aesthetic and causes performance overhead, which will be replaced by a static HD image.

## Goals / Non-Goals

**Goals:**
- Implement SMTP in the backend using `nodemailer` to securely transmit password reset codes.
- Add admin UI components for editing the curriculum tech tree and the site logo.
- Replace the 3D WebGL element on the landing page with a static `<img />` component.
- Fix the double slash `//` glitch in the admin header.

**Non-Goals:**
- Complete restructuring of the Admin CMS Panel.
- Deep architectural changes to how site configuration is stored (we will rely on existing DB config storage mechanisms like Turso SQL).

## Decisions

- **SMTP Provider**: We will use `nodemailer` for handling email transmission, relying on environment variables for SMTP credentials.
- **Admin Configuration Storage**: Will reuse existing `/api/site-content` or similar configuration tables to store the new logo URL and Tech Tree JSON payload without adding new tables unless strictly necessary.
- **Hero Image**: Will use a simple `<img />` or background image with Tailwind/CSS for responsive display rather than maintaining the complex `Three.js` setup.

## Risks / Trade-offs

- **SMTP Delivery Failure**: Email delivery might fail due to strict spam filters. Mitigation: Log SMTP errors in the backend and provide a user-friendly error message on the frontend.
