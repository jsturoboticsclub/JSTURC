# Design: Modernize Robotics Club Digital Experience

## Context
See `proposal.md` for background and user motivations.
The current platform is a Vite + React 18 SPA styled with TailwindCSS and Lucide Icons, connected to an Express 5 backend with Turso Cloud SQLite and Cloudinary media storage. The frontend has a structured `JSTULandingPage.tsx`, but lacks robotics-specific interactive components (e.g. real-time telemetry, 3D visualization, interactive tech trees). The updates must integrate seamlessly into the existing React SPA architecture without breaking current routing, auth, or CMS capabilities.

## Goals / Non-Goals

**Goals:**
- Provide a responsive, high-performance 3D robotic visualization that interacts smoothly with user cursor and touch inputs.
- Implement a real-time lab status ticker and telemetry monitor with resilient simulated streaming and future API hook readiness.
- Implement an interactive, node-based curriculum tech tree with filtering, prerequisites, and project deep-links.
- Enhance project cards with comprehensive engineering modals detailing BOM, schematics, and live project attributes.
- Modernize Admin CMS Panel with a modular, responsive command-center layout, persistent sidebar, live preview toggle, and instant feedback.
- Maintain rapid first-contentful-paint (FCP) and 60fps interaction performance across mobile and desktop devices.

**Non-Goals:**
- Full WebGL game engine implementation or heavy multi-megabyte 3D model downloads.
- Heavy backend state rewrite (the backend will provide lightweight endpoints without altering existing database schemas).
- Breaking existing Admin API contracts, user permissions, or database schemas in Turso.
- Any destructive SQL queries or migrations that overwrite live Turso Cloud records.

## Decisions

### Decision 1: Procedural Multi-Model 3D Robotics Explorer & Educational Spec Panel
- **Choice**: Implement an interactive, procedural 3D model engine in Three.js supporting 5 distinct robotics hardware models:
  1. *Autonomous Mobile Rover* (chassis, 4 all-terrain wheels, lidar scanning mast, ultrasonic telemetry)
  2. *Articulated Robotic Arm* (6-DOF base, shoulder, elbow, wrist, and two-finger pneumatic gripper)
  3. *Arduino / Microcontroller Dev Board* (ATmega328P IC, dual GPIO female headers, USB-B port, crystal oscillator, status LEDs)
  4. *Bipedal Android / Humanoid Bot* (servo torso, stereoscopic sensor head, articulated limbs)
  5. *Aerial Drone / Quadcopter* (X-geometry carbon frame, 4 high-speed rotors, central flight controller, camera gimbal)
  Coupled with a side-by-side Educational Description and Telemetry Panel detailing kinematics, computing architecture, and lab student applications.
- **Rationale**: Procedural mathematical geometry runs in 60fps across all devices without downloading multi-megabyte CAD files, while educating prospective students on core robotics subsystems.

### Decision 2: Telemetry Data Streaming Architecture
- **Choice**: Dual-mode telemetry service — live WebSocket/polling when connected to the lab gateway, falling back to realistic stochastic physics simulation when the physical lab is idle or offline.
- **Rationale**: Guarantees that the landing page always feels dynamic and alive even during late nights, weekends, or lab maintenance cycles.

### Decision 3: Component Architecture for Tech Tree
- **Choice**: SVG + React component-based hierarchical graph with CSS transition animations and active state highlighting.
- **Rationale**: Zero external canvas graph dependencies, crisp rendering on high-DPI displays, fully accessible DOM elements, and seamless responsive reflow.

### Decision 4: White/Light Default Admin Command Center with Sticky Sidebar
- **Choice**: Render the Admin CMS in a clean, high-contrast white/light theme by default with a dedicated Light/Dark toggle in the command bar. Make the navigation sidebar sticky (`fixed`/`sticky` with internal scrolling) so navigation actions remain in viewport as the administrator scrolls down long tables. Remove obsolete duplicate tab buttons under the "Dynamic Site & System Manager" header.
- **Rationale**: Improves administrative ergonomic comfort during prolonged editing sessions and eliminates disruptive scrolling back to the top of long lists.

### Decision 5: Universal Visitor & Landing Page Theme Synchronization
- **Choice**: Synchronize all visitor sections (Hero, Telemetry ticker, 3D Canvas, Curriculum Tree, BOM Inspector, Committees, Join form, Footer) to the global theme context.
- **Rationale**: Ensures every single card, text passage, border, and badge instantly updates without mismatched dark backgrounds remaining when in light mode.

### Decision 6: Turso Cloud SQL Zero-Destruction Guarantee
- **Choice**: All backend database queries in `jstuRoutes.js` and services must be strictly additive and backward-compatible.
- **Rationale**: Preserves all existing live user accounts, committee assignments, and site configurations configured through the administrative panel.

## Risks / Trade-offs

- **[Performance on low-end mobile devices]** → Canvas rendering includes automated frame-rate throttling (caps at 30fps if frame drops detected) and respects `prefers-reduced-motion`.
- **[Visual clutter / cognitive overload]** → Clean cybernetic HUD design with collapsible/expandable sections and intuitive tab filters to keep primary navigation clear.
- **[Bundle size expansion]** → Tree-shaken imports, dynamic lazy loading of the 3D canvas and rich modal dialogs via `React.lazy()` and `Suspense`.
- **[Admin state synchronization during refactoring]** → Retain all existing REST API contracts and local storage authentication flows; refactor frontend view layer cleanly while keeping data signatures identical.

## Migration Plan

1. Develop isolated modular components in `src/components/telemetry/`, `src/components/canvas/`, and `src/components/techtree/`.
2. Extract Admin CMS sub-panels into modular components under `src/components/admin/` with unified layout shell.
3. Integrate components progressively into `src/pages/JSTULandingPage.tsx` and `src/pages/AdminCMSPanel.tsx`.
4. Verify responsive layout across mobile, tablet, and widescreen viewports.
5. Run regression testing on existing login, CMS, and project submission flows.

