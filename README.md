# 🤖 JSTURC - Jamalpur Science and Technology University Robotics Club

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.11-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL_Engine-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

> **Next-Generation Robotics Club Portal & Autonomous Systems Management Hub**  
> Empowering students, roboticists, and researchers at Jamalpur Science and Technology University (JSTU) to design, fabricate, and showcase cutting-edge autonomous rovers, drones, and AI hardware.

---

## 🌟 Key Highlights

### ⚡ Cybernetic & Responsive User Experience
- **Futuristic Dark-Mode Glassmorphism**: Tailored cyber-amber and neon-emerald accents, glowing HUD borders, and smooth micro-animations.
- **Adaptive Navigation**: Responsive navigation bar with active section tracking, theme controls, and mobile slide-out drawer.
- **Cyberpunk 404 & Resilient Error Boundary**: Interactive terminal-inspired error screens with quick diagnostics, status recovery, and system state rollback.

### 🏛️ Dynamic Annual Committee Architecture & Tenure Archival
- **Multi-Tenure History**: Seamlessly archives past executive committees with sequential committee numbers (e.g., Committee 01, Committee 02).
- **Hierarchical Categorization**: Automatic classification into **Executive**, **Technical Leads**, **Advisors**, and **General Members**, with manual admin overrides.
- **Dedicated Committee Showcase (`/committees`)**: Visitors can explore the running committee or switch to past committees to inspect rosters, tenures, mottos, and leadership records.

### 🛠️ Robust Admin CMS Control Center (`/admin`)
- **Live Content Management**: Direct editing of hero banners, club mission, dynamic milestone cards, workshops, and competition schedules.
- **Project Proposal System**: Review, approve, or reject student project submissions with category tagging and live showcase publishing.
- **User Registry & Role Governance**: Manage members, promote committee roles, inspect departments and student IDs, and assign executive permissions.
- **Site Security Engine**: Toggle rate limiting, inspect security headers, and monitor server health.

### 🚀 High-Performance Backend with SQLite WAL Core
- **PRAGMA WAL (Write-Ahead Logging)**: High-concurrency zero-lock reading and fast atomic writes.
- **Memory-Mapped I/O (MMAP)**: 256MB memory mapping and 64MB in-memory query cache for instant database responses.
- **Zero-Setup Bootstrap**: Automatically creates tables, runs safe schema migrations, and seeds initial data on first launch.

### 🛡️ Security & Enterprise Protection
- **Role-Based Access Control (RBAC)**: Strong route guards (`AdminRouteGuard`, `ProtectedRoute`) preventing unauthorized access to administrative routes.
- **JWT & Password Security**: High-entropy JWT tokens with salted Bcrypt password hashing.
- **API Guard**: Strict rate limiting, helmet security headers, sanitized query parameters, and anti-abuse protection.

---

## 📁 Project Architecture

```
Uni_Club/
├── src/
│   ├── components/
│   │   ├── AdminRouteGuard.tsx    # Strict RBAC guard for administrative endpoints
│   │   ├── ProtectedRoute.tsx     # Route guard for authenticated club members
│   │   ├── ErrorBoundary.tsx      # Cyberpunk UI error fallback
│   │   ├── JSTUHeader.tsx         # Responsive HUD navigation header
│   │   └── Layout.tsx             # Global application shell
│   ├── context/
│   │   └── UserContext.tsx        # Authentication & global member state
│   ├── pages/
│   │   ├── JSTULandingPage.tsx    # Futuristic club portal landing page
│   │   ├── AdminCMSPanel.tsx      # Comprehensive club management CMS
│   │   ├── CommitteesPage.tsx     # Committee tenure & roster directory
│   │   ├── MemberDashboard.tsx    # Member profile & project proposals
│   │   ├── MemberDetailPage.tsx   # Detailed roboticist profile
│   │   ├── AuthPage.tsx           # Member login & onboarding
│   │   └── NotFoundPage.tsx       # Dynamic cyber 404 page
│   ├── App.tsx                    # Root React component & route trees
│   └── main.tsx                   # Client bootstrap
│
├── uniclub-backend/
│   ├── data/
│   │   └── jstu_robotics.db       # High-performance SQLite database
│   ├── middleware/
│   │   └── auth.js                # JWT verification & admin check middleware
│   ├── routes/
│   │   ├── jstuRoutes.js          # Club CMS, committees, projects, & milestones
│   │   └── userRouter.js          # Authentication, registration & user registry
│   ├── db.js                      # WAL SQLite engine, auto-migrator & seeders
│   └── index.js                   # Express REST API server entrypoint
│
├── public/                        # Static assets & robot schematics
└── vite.config.ts                 # Vite bundler configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**

---

### 1. Clone the Repository
```bash
git clone https://github.com/jsturoboticsclub/JSTURC.git
cd JSTURC
```

### 2. Install Dependencies

**Install Frontend Dependencies:**
```bash
npm install
```

**Install Backend Dependencies:**
```bash
cd uniclub-backend
npm install
cd ..
```

---

### 3. Environment Variables Configuration

Create a `.env` file inside `uniclub-backend/`:

```env
PORT=5000
JWT_SECRET=super_secret_jstu_robotics_jwt_key_2026
NODE_ENV=development
```

*(Optional)* Create a `.env` in the root folder for Vite:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### 4. Running the Development Servers

#### Option A: Run Both Together (from root)
```bash
npm run dev
```

#### Option B: Run Concurrently in Separate Terminals

**Terminal 1 — Backend (Express REST API):**
```bash
cd uniclub-backend
node index.js
# Output: ✅ Connected to JSTU Robotics SQLite database at ...
# Output: 🚀 JSTU Robotics Club API running on port 5000
```

**Terminal 2 — Frontend (Vite Dev Server):**
```bash
npm run dev
# Output: Local: http://localhost:8081/
```

Open [http://localhost:8081](http://localhost:8081) in your browser!

---

## 🔑 Default Administrator Credentials

On first run, the SQLite database auto-seeds a default administrator account:

| Role | Email | Password |
|---|---|---|
| **Club Administrator** | `admin@jstu.edu` | `Admin@123` |

> ⚠️ **Security Notice**: Immediately log in to the Admin Panel at `/admin` and update the administrator credentials in production!

---

## 🌐 API Overview

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/jstu/content` | Public | Retrieve live CMS content (hero, mission, badges) |
| `PUT` | `/api/jstu/content/:key` | Admin | Update site section content |
| `GET` | `/api/jstu/committees` | Public | List all annual committees and member rosters |
| `POST` | `/api/jstu/committees` | Admin | Create a new tenure committee |
| `PUT` | `/api/jstu/committees/:id/set-current` | Admin | Switch the running committee tenure |
| `GET` | `/api/jstu/projects` | Public | List all approved club robotics projects |
| `POST` | `/api/jstu/projects` | Authenticated | Propose a new engineering project |
| `PUT` | `/api/jstu/projects/:id/status` | Admin | Approve or reject project proposal |
| `GET` | `/api/jstu/milestones` | Public | List scheduled club milestones & competitions |
| `POST` | `/api/jstu/milestones` | Admin | Add a new milestone / field trial |
| `POST` | `/api/users/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/users/register` | Public | Register new student member |
| `GET` | `/api/users/all` | Admin | List all registered members with roles |

---

## 🚢 Production Deployment

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Link your GitHub repository (`jsturoboticsclub/JSTURC`).
2. Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://api.jsturobotics.org/api`)

### Backend (Render / Railway / VPS / Fly.io)
1. Deploy the `uniclub-backend` directory as a Node.js web service.
2. Build & Start Command:
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
3. Environment Variables:
   - `PORT`: `5000` (or assigned by host)
   - `JWT_SECRET`: A long random cryptographically secure string
   - `NODE_ENV`: `production`
4. **Persistent Disk (Recommended for SQLite)**:
   - Mount a persistent volume at `uniclub-backend/data` so that your SQLite database survives service restarts and re-deployments.

---

## 🤝 Contributing

Contributions, bug reports, and robotics project showcases are always welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AutonomousRover`)
3. Commit your Changes (`git commit -m 'feat: add LiDAR obstacle avoidance documentation'`)
4. Push to the Branch (`git push origin feature/AutonomousRover`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Engineered with ❤️ by Jamalpur Science and Technology University Robotics Club</sub>
</div>
