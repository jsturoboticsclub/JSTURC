const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.TURSO_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let tursoClient = null;
let db = null;

if (tursoUrl && tursoAuthToken) {
  const { createClient } = require('@libsql/client');
  tursoClient = createClient({ url: tursoUrl, authToken: tursoAuthToken });
  console.log('✅ Connected to Turso Cloud SQLite database at', tursoUrl);
  initDatabase();
} else {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'jstu_robotics.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Failed to open SQLite database:', err.message);
    } else {
      console.log('✅ Connected to JSTU Robotics SQLite database at', dbPath);
      // Performance & concurrency optimizations:
      db.run('PRAGMA journal_mode = WAL;');
      db.run('PRAGMA synchronous = NORMAL;');
      db.run('PRAGMA cache_size = -64000;'); // 64MB in-memory query cache
      db.run('PRAGMA temp_store = MEMORY;');
      db.run('PRAGMA mmap_size = 268435456;'); // 256MB memory-mapped I/O for zero-copy reads
      initDatabase();
    }
  });
}

// Promisified query helpers (Works seamlessly with Turso Cloud or local SQLite)
async function runQuery(sql, params = []) {
  if (tursoClient) {
    const res = await tursoClient.execute({ sql, args: params });
    return {
      id: res.lastInsertRowid != null ? Number(res.lastInsertRowid) : undefined,
      changes: res.rowsAffected
    };
  }
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

async function getQuery(sql, params = []) {
  if (tursoClient) {
    const res = await tursoClient.execute({ sql, args: params });
    if (!res.rows || res.rows.length === 0) return null;
    return { ...res.rows[0] };
  }
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function allQuery(sql, params = []) {
  if (tursoClient) {
    const res = await tursoClient.execute({ sql, args: params });
    return res.rows.map(row => ({ ...row }));
  }
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDatabase() {
  const tableDefinitions = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Admin', 'Member')) DEFAULT 'Member',
      status TEXT NOT NULL CHECK(status IN ('approved', 'pending', 'rejected')) DEFAULT 'approved',
      committee_role TEXT DEFAULT 'Standard Member',
      department TEXT DEFAULT 'Computer Science & Engineering',
      student_id TEXT,
      bio TEXT,
      skills TEXT,
      profile_photo TEXT,
      contact_links TEXT,
      project_contributions TEXT,
      committee_category TEXT DEFAULT 'Auto',
      committee_id INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      section TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      meta_json TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      image_url TEXT,
      github_link TEXT,
      tech_stack TEXT,
      team_members TEXT,
      approval_status TEXT DEFAULT 'approved',
      submitted_by_id INTEGER,
      submitted_by_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS agenda_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT,
      badge TEXT,
      order_num INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS directory_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      priority INTEGER DEFAULT 0,
      category TEXT DEFAULT 'Executive'
    )`,
    `CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT DEFAULT 'normal',
      author_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS committees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      committee_number INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      session_years TEXT NOT NULL,
      is_current INTEGER DEFAULT 0,
      theme_motto TEXT,
      description TEXT,
      banner_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS committee_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      committee_id INTEGER NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT,
      department TEXT DEFAULT 'Computer Science & Engineering',
      student_id TEXT,
      designation TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Executive', 'Lead', 'Advisor', 'Member')),
      is_override INTEGER DEFAULT 0,
      profile_photo TEXT,
      bio TEXT,
      skills TEXT,
      social_links TEXT,
      display_order INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const sql of tableDefinitions) {
    try {
      await runQuery(sql);
    } catch (err) {
      // Table already exists or silent pass
    }
  }

  // Safe Column Migrations
  try { await runQuery(`ALTER TABLE projects ADD COLUMN approval_status TEXT DEFAULT 'approved'`); } catch (e) { }
  try { await runQuery(`ALTER TABLE projects ADD COLUMN submitted_by_id INTEGER`); } catch (e) { }
  try { await runQuery(`ALTER TABLE projects ADD COLUMN submitted_by_name TEXT`); } catch (e) { }
  try { await runQuery(`ALTER TABLE users ADD COLUMN committee_category TEXT DEFAULT 'Auto'`); } catch (e) { }
  try { await runQuery(`ALTER TABLE users ADD COLUMN committee_id INTEGER DEFAULT 1`); } catch (e) { }

  await seedInitialData();
  await ensureMasterAdmin();
  await ensureRegisteredMembers();
}

async function seedInitialData() {
  try {
    // Seed Directory Roles if empty
    const roleCount = await getQuery('SELECT COUNT(*) as count FROM directory_roles');
    if (roleCount.count === 0) {
      const defaultRoles = [
        { name: 'President & System Architect', priority: 1, category: 'Executive' },
        { name: 'Vice Chair & Hardware Lead', priority: 2, category: 'Executive' },
        { name: 'General Secretary', priority: 3, category: 'Executive' },
        { name: 'AI & Autonomous Navigation Lead', priority: 4, category: 'Technical' },
        { name: 'Embedded Systems & Firmware Engineer', priority: 5, category: 'Technical' },
        { name: 'Mechanical & CAD Design Specialist', priority: 6, category: 'Technical' },
        { name: 'Research & Competition Coordinator', priority: 7, category: 'Operations' },
        { name: 'Standard Member', priority: 8, category: 'General' }
      ];
      for (const r of defaultRoles) {
        await runQuery(
          'INSERT INTO directory_roles (name, priority, category) VALUES (?, ?, ?)',
          [r.name, r.priority, r.category]
        );
      }
      console.log('🌱 Seeded default directory roles');
    }

    // Seed Site Content if empty
    const contentCount = await getQuery('SELECT COUNT(*) as count FROM site_content');
    if (contentCount.count === 0) {
      const defaultContent = [
        {
          key: 'hero_title',
          section: 'hero',
          title: 'Main Hero Heading',
          content: 'Jamalpur Science and Technology University Robotics Club',
          meta_json: JSON.stringify({
            badge: '⚡ JSTU Robotics Lab Online',
            subtitle: 'Engineering Intelligent Machines, Pioneering Autonomous Frontiers',
            cta_primary_text: 'Join the Robotics Club',
            cta_secondary_text: 'Explore Projects & Lab'
          })
        },
        {
          key: 'hero_mission',
          section: 'hero',
          title: 'Hero Mission Statement',
          content: 'To foster an elite collaborative ecosystem of engineering innovation, competitive robotics, and applied artificial intelligence at Jamalpur Science and Technology University. We empower undergraduate researchers to design, fabricate, and deploy world-class autonomous systems that solve real-world industrial and humanitarian challenges.',
          meta_json: JSON.stringify({
            stats: [
              { label: 'Autonomous Bots Built', value: '14+' },
              { label: 'Active Roboticists', value: '92+' },
              { label: 'National Competitions', value: '6 Won' },
              { label: 'Research Tracks', value: '5 Labs' }
            ]
          })
        },
        {
          key: 'agenda_overview',
          section: 'agenda',
          title: 'Club Mission & Vision',
          content: 'Founded at Jamalpur Science and Technology University (JSTU), our club unites students across Computer Science & Engineering, Electrical & Electronic Engineering, and Mechanical disciplines. Our mission is to bridge academic theory with cutting-edge hands-on robotics engineering.',
          meta_json: JSON.stringify({
            pillars: [
              { title: 'Autonomous Navigation & SLAM', desc: 'Developing LiDAR and vision-based localization for GPS-denied environments.' },
              { title: 'Embedded Robotics & IoT', desc: 'Custom PCB design, STM32 firmware architecture, and ultra-low latency motor control.' },
              { title: 'Bio-inspired & Combat Robotics', desc: 'Kinematic modeling of multi-legged robots, high-durability battle robots, and soft robotics.' },
              { title: 'National & Global Contests', desc: 'Representing JSTU at national robotics festivals, hackathons, and rover challenges.' }
            ]
          })
        },
        {
          key: 'membership_info',
          section: 'membership',
          title: 'Membership & Requirements',
          content: 'Membership is open to all passionate JSTU students. Whether you are proficient in C++, ROS, circuit soldering, CAD 3D modeling, or simply eager to learn from our senior project leads, you will find mentorship, lab access, and high-impact project opportunities.',
          meta_json: JSON.stringify({
            perks: [
              '24/7 Access to JSTU Robotics Hardware Workshop & 3D Printers',
              'Mentorship from senior engineers & faculty advisors',
              'Sponsorship for national robotics competitions & travel',
              'Hands-on training in ROS2, OpenCV, embedded C++, and SolidWorks'
            ]
          })
        }
      ];

      for (const item of defaultContent) {
        await runQuery(
          'INSERT INTO site_content (key, section, title, content, meta_json) VALUES (?, ?, ?, ?, ?)',
          [item.key, item.section, item.title, item.content, item.meta_json]
        );
      }
      console.log('🌱 Seeded dynamic site content');
    }

    // Ensure milestones_header is present in site_content
    const milestonesCheck = await getQuery("SELECT key FROM site_content WHERE key = 'milestones_header'");
    if (!milestonesCheck) {
      await runQuery(
        'INSERT INTO site_content (key, section, title, content, meta_json) VALUES (?, ?, ?, ?, ?)',
        ['milestones_header', 'agenda', 'Upcoming Club Milestones', 'Upcoming Club Milestones', JSON.stringify({ subtitle: 'Scheduled field trials, workshops, and competitions' })]
      );
    }

    // Seed Agenda Items if empty
    const agendaCount = await getQuery('SELECT COUNT(*) as count FROM agenda_items');
    if (agendaCount.count === 0) {
      const defaultAgenda = [
        {
          title: 'JSTU Autonomous Rover Field Trial (Phase II)',
          description: 'Outdoor testing of autonomous obstacle traversal and GPS waypoint navigation at the JSTU central field.',
          date: 'October 24, 2026',
          badge: 'Field Test',
          order_num: 1
        },
        {
          title: 'Workshop: Mastering ROS2 & Gazebo Simulation',
          description: 'Hands-on bootcamp covering robotic kinematics, URDF modeling, and simulation pipelines for new members.',
          date: 'November 05, 2026',
          badge: 'Workshop',
          order_num: 2
        },
        {
          title: 'National Robotics Championship 2026 Participation',
          description: 'Deploying the JSTU Line Follower and Combat Bot teams to compete in the national robotics showdown.',
          date: 'December 12, 2026',
          badge: 'Competition',
          order_num: 3
        },
        {
          title: 'RoboExpo & Annual Project Showcase',
          description: 'Demonstrating all lab projects to university faculty, industry partners, and tech enthusiasts.',
          date: 'January 18, 2027',
          badge: 'Exhibition',
          order_num: 4
        }
      ];
      for (const a of defaultAgenda) {
        await runQuery(
          'INSERT INTO agenda_items (title, description, date, badge, order_num) VALUES (?, ?, ?, ?, ?)',
          [a.title, a.description, a.date, a.badge, a.order_num]
        );
      }
      console.log('🌱 Seeded agenda items');
    }

    // Seed Projects if empty
    const projectCount = await getQuery('SELECT COUNT(*) as count FROM projects');
    if (projectCount.count === 0) {
      const defaultProjects = [
        {
          title: 'Rover-JSTU: Mars Planetary Prototype',
          category: 'Autonomous Terrestrial',
          description: 'A 6-wheel rocker-bogie exploration rover equipped with a 4-DOF manipulator arm, stereo depth cameras, and onboard Jetson Orin Nano running real-time SLAM.',
          status: 'Active Development',
          image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
          github_link: 'https://github.com/jstu-robotics/rover-jstu',
          tech_stack: JSON.stringify(['ROS2 Humble', 'Jetson Orin', 'Python', 'C++', 'LiDAR', 'Rocker-Bogie']),
          team_members: JSON.stringify(['Tahmid Rahman', 'Sadia Afrin', 'Fahim Morshed'])
        },
        {
          title: 'AeroBot: Vision-Guided Search & Rescue Quadcopter',
          category: 'Aerial Robotics',
          description: 'Custom carbon-fiber drone designed for GPS-denied indoor reconnaissance using optical flow sensors and YOLOv8 real-time thermal human detection.',
          status: 'Field Testing',
          image_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
          github_link: 'https://github.com/jstu-robotics/aerobot-vision',
          tech_stack: JSON.stringify(['PX4 Autopilot', 'OpenCV', 'YOLOv8', 'STM32', 'Carbon Fiber']),
          team_members: JSON.stringify(['Mahmudul Hasan', 'Anika Tabassum'])
        },
        {
          title: 'HexaCrawler: 18-DOF Biomimetic Hexapod',
          category: 'Biomimetic Walking Robots',
          description: 'A multi-legged crawler with forward and inverse kinematic solvers capable of adapting to rough terrain, stair climbing, and pipe inspection.',
          status: 'Prototype Verified',
          image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          github_link: 'https://github.com/jstu-robotics/hexacrawler',
          tech_stack: JSON.stringify(['Inverse Kinematics', 'MG996R Servos', 'ESP32', 'FreeRTOS', '3D Print PLA+']),
          team_members: JSON.stringify(['Tahmid Rahman', 'Zahidul Islam'])
        },
        {
          title: 'RoboSoccer Striker: High-Speed Autonomous Bot',
          category: 'Competitive Robotics',
          description: 'Omni-directional wheel robotic vehicle with brushless electromagnetic solenoid kicker and 360-degree high-frame mirror camera tracking.',
          status: 'Competition Ready',
          image_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
          github_link: 'https://github.com/jstu-robotics/robosoccer',
          tech_stack: JSON.stringify(['Omni Wheels', 'BLDC Motors', 'Custom PCB', 'PID Tuning']),
          team_members: JSON.stringify(['Fahim Morshed', 'Zahidul Islam'])
        }
      ];

      for (const p of defaultProjects) {
        await runQuery(
          'INSERT INTO projects (title, category, description, status, image_url, github_link, tech_stack, team_members) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [p.title, p.category, p.description, p.status, p.image_url, p.github_link, p.tech_stack, p.team_members]
        );
      }
      console.log('🌱 Seeded projects');
    }

    // Seed Announcements if empty
    const announceCount = await getQuery('SELECT COUNT(*) as count FROM announcements');
    if (announceCount.count === 0) {
      const defaultAnnouncements = [
        {
          title: 'Welcome to the 2026 Academic Term!',
          content: 'All active club members are invited to attend the General Body Meeting on Sunday at 4:00 PM in Lab 304. We will be delegating research tracks for the National Rover Challenge.',
          priority: 'high',
          author_name: 'Tahmid Rahman (President)'
        },
        {
          title: 'New Hardware Arrival: Jetson Orin Nano & RPLiDAR A1',
          content: 'The robotics department has provided 3 Jetson developer kits and 2 360-degree LiDAR units for member research projects. Submit project proposals to the Lab Lead to requisition components.',
          priority: 'normal',
          author_name: 'Sadia Afrin (Vice Chair)'
        }
      ];
      for (const a of defaultAnnouncements) {
        await runQuery(
          'INSERT INTO announcements (title, content, priority, author_name) VALUES (?, ?, ?, ?)',
          [a.title, a.content, a.priority, a.author_name]
        );
      }
      console.log('🌱 Seeded announcements');
    }

    // Seed Users if empty
    const userCount = await getQuery('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash('admin123', salt);
      const memberPass = await bcrypt.hash('member123', salt);

      const defaultUsers = [
        {
          email: 'admin@jstu.edu',
          password_hash: adminPass,
          name: 'Prof. Dr. M. K. Alam',
          role: 'Admin',
          status: 'approved',
          committee_role: 'Chief Technical Director & Faculty Advisor',
          department: 'Computer Science & Engineering',
          student_id: 'FAC-JSTU-01',
          bio: 'Faculty Advisor and Mentor for the JSTU Robotics Club. Specializes in autonomous cyber-physical systems, multi-agent robotic coordination, and artificial intelligence.',
          skills: JSON.stringify(['Robotics Architecture', 'Control Systems', 'AI & Machine Learning', 'Research Leadership']),
          profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          contact_links: JSON.stringify({ email: 'admin@jstu.edu', website: 'https://jstu.edu/faculty/alam' }),
          project_contributions: JSON.stringify(['Club Founder', 'Research Advisor for Rover-JSTU', 'Grant Supervisor'])
        },
        {
          email: 'president@jstu.edu',
          password_hash: adminPass,
          name: 'Tahmid Rahman',
          role: 'Admin',
          status: 'approved',
          committee_role: 'President & System Architect',
          department: 'Computer Science & Engineering',
          student_id: 'JSTU-CSE-2101',
          bio: 'Final year CSE undergraduate leading overall system architecture and ROS2 autonomy pipelines. Experienced in robotic trajectory optimization, embedded Linux, and hardware prototyping.',
          skills: JSON.stringify(['ROS2', 'C++', 'Python', 'SLAM', 'Kinematic Modeling', 'Linux Kernel']),
          profile_photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
          contact_links: JSON.stringify({ email: 'president@jstu.edu', github: 'https://github.com/tahmid-jstu', linkedin: 'https://linkedin.com/in/tahmid-rahman' }),
          project_contributions: JSON.stringify(['Lead Architect: Rover-JSTU', 'Co-designer: HexaCrawler', 'Driver: RoboSoccer'])
        },
        {
          email: 'member@jstu.edu',
          password_hash: memberPass,
          name: 'Sadia Afrin',
          role: 'Member',
          status: 'approved',
          committee_role: 'Vice Chair & Hardware Lead',
          department: 'Electrical & Electronic Engineering',
          student_id: 'JSTU-EEE-2144',
          bio: 'Hardware engineer with a focus on custom PCB routing, power distribution systems, motor drivers, and low-level firmware for robotic manipulators.',
          skills: JSON.stringify(['Altium Designer', 'KiCad', 'STM32', 'Power Electronics', 'Brushless Motor Control', 'Soldering']),
          profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          contact_links: JSON.stringify({ email: 'member@jstu.edu', github: 'https://github.com/sadia-hardware', linkedin: 'https://linkedin.com/in/sadia-afrin' }),
          project_contributions: JSON.stringify(['Power Distribution System: Rover-JSTU', 'Custom Flight Controller: AeroBot'])
        },
        {
          email: 'fahim@jstu.edu',
          password_hash: memberPass,
          name: 'Fahim Morshed',
          role: 'Member',
          status: 'approved',
          committee_role: 'AI & Autonomous Navigation Lead',
          department: 'Computer Science & Engineering',
          student_id: 'JSTU-CSE-2208',
          bio: 'Robotics enthusiast specializing in computer vision, LiDAR point cloud segmentation, and reinforcement learning for mobile robot obstacle avoidance.',
          skills: JSON.stringify(['PyTorch', 'OpenCV', 'CUDA', 'Point Cloud Library', 'YOLOv8', 'Gazebo']),
          profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          contact_links: JSON.stringify({ email: 'fahim@jstu.edu', github: 'https://github.com/fahim-ai' }),
          project_contributions: JSON.stringify(['Vision Navigation: AeroBot', 'Target Tracking: RoboSoccer Striker'])
        },
        {
          email: 'anika@jstu.edu',
          password_hash: memberPass,
          name: 'Anika Tabassum',
          role: 'Member',
          status: 'approved',
          committee_role: 'Mechanical & CAD Design Specialist',
          department: 'Mechanical Engineering',
          student_id: 'JSTU-ME-2215',
          bio: 'Passionate mechanical modeler crafting lightweight carbon-fiber chassis, harmonic drive gearboxes, and stress-tested robotic appendages.',
          skills: JSON.stringify(['SolidWorks', 'Fusion 360', 'FEA Analysis', '3D Printing (FDM/SLA)', 'CNC Machining']),
          profile_photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
          contact_links: JSON.stringify({ email: 'anika@jstu.edu', linkedin: 'https://linkedin.com/in/anika-tabassum' }),
          project_contributions: JSON.stringify(['Chassis Fabrication: HexaCrawler', 'Arm Stress Analysis: Rover-JSTU'])
        },
        {
          email: 'pending.student@jstu.edu',
          password_hash: memberPass,
          name: 'Rafiqul Islam',
          role: 'Member',
          status: 'pending',
          committee_role: 'Applicant (Standard Member)',
          department: 'Computer Science & Engineering',
          student_id: 'JSTU-CSE-2319',
          bio: 'First-year CSE student eager to learn Arduino programming and build line follower robots.',
          skills: JSON.stringify(['C Programming', 'Arduino Basics', 'Breadboarding']),
          profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          contact_links: JSON.stringify({ email: 'pending.student@jstu.edu' }),
          project_contributions: JSON.stringify(['Junior Lab Apprentice'])
        }
      ];

      for (const u of defaultUsers) {
        await runQuery(
          `INSERT INTO users (email, password_hash, name, role, status, committee_role, department, student_id, bio, skills, profile_photo, contact_links, project_contributions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            u.email, u.password_hash, u.name, u.role, u.status, u.committee_role, u.department,
            u.student_id, u.bio, u.skills, u.profile_photo, u.contact_links, u.project_contributions
          ]
        );
      }
      console.log('🌱 Seeded default users with roles and member profiles');
    }

    // Seed Committees and Committee Members if empty
    const committeeCount = await getQuery('SELECT COUNT(*) as count FROM committees');
    if (committeeCount.count === 0) {
      // Create Committee #1 (Current Running Committee)
      const res1 = await runQuery(
        `INSERT INTO committees (committee_number, title, session_years, is_current, theme_motto, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          1,
          '1st Executive Committee',
          '2025–2026',
          1,
          'Founding Autonomous Frontiers & Systems Lab',
          'The pioneer founding committee of the Jamalpur Science and Technology University Robotics Club, responsible for establishing the robotics research tracks, student lab infrastructure, and autonomous rover field testing.'
        ]
      );

      // Create Committee #2 (Archived / Upcoming Tenure)
      const res2 = await runQuery(
        `INSERT INTO committees (committee_number, title, session_years, is_current, theme_motto, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          2,
          '2nd Executive Committee',
          '2026–2027',
          0,
          'Swarm Intelligence & Aerial Autonomy Scale',
          'The incoming executive tenure advancing swarm drone platforms, multi-agent SLAM algorithms, and hosting the regional university robotics symposium.'
        ]
      );

      // Seed members for Committee #1
      const c1Members = [
        {
          name: 'Prof. Dr. M. K. Alam',
          email: 'admin@jstu.edu',
          department: 'Computer Science & Engineering',
          student_id: 'FAC-JSTU-01',
          designation: 'Chief Technical Director & Faculty Advisor',
          category: 'Advisor',
          is_override: 0,
          profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bio: 'Faculty Advisor and Mentor for the JSTU Robotics Club. Specializes in autonomous cyber-physical systems, multi-agent robotic coordination, and artificial intelligence.',
          skills: JSON.stringify(['Robotics Architecture', 'Control Systems', 'AI & Machine Learning', 'Research Leadership']),
          display_order: 1
        },
        {
          name: 'Tahmid Rahman',
          email: 'president@jstu.edu',
          department: 'Computer Science & Engineering',
          student_id: 'JSTU-CSE-2101',
          designation: 'President & System Architect',
          category: 'Executive',
          is_override: 0,
          profile_photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
          bio: 'Final year CSE undergraduate leading overall system architecture and ROS2 autonomy pipelines. Experienced in robotic trajectory optimization, embedded Linux, and hardware prototyping.',
          skills: JSON.stringify(['ROS2', 'C++', 'Python', 'SLAM', 'Kinematic Modeling', 'Linux Kernel']),
          display_order: 2
        },
        {
          name: 'Sadia Afrin',
          email: 'member@jstu.edu',
          department: 'Electrical & Electronic Engineering',
          student_id: 'JSTU-EEE-2144',
          designation: 'Vice Chair & Hardware Lead',
          category: 'Executive',
          is_override: 0,
          profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          bio: 'Hardware engineer with a focus on custom PCB routing, power distribution systems, motor drivers, and low-level firmware for robotic manipulators.',
          skills: JSON.stringify(['Altium Designer', 'KiCad', 'STM32', 'Power Electronics', 'Brushless Motor Control']),
          display_order: 3
        },
        {
          name: 'Fahim Morshed',
          email: 'fahim@jstu.edu',
          department: 'Computer Science & Engineering',
          student_id: 'JSTU-CSE-2208',
          designation: 'AI & Autonomous Navigation Lead',
          category: 'Lead',
          is_override: 0,
          profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          bio: 'Robotics enthusiast specializing in computer vision, LiDAR point cloud segmentation, and reinforcement learning for mobile robot obstacle avoidance.',
          skills: JSON.stringify(['PyTorch', 'OpenCV', 'CUDA', 'Point Cloud Library', 'YOLOv8', 'Gazebo']),
          display_order: 4
        },
        {
          name: 'Anika Tabassum',
          email: 'anika@jstu.edu',
          department: 'Mechanical Engineering',
          student_id: 'JSTU-ME-2215',
          designation: 'Mechanical & CAD Design Specialist',
          category: 'Lead',
          is_override: 0,
          profile_photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
          bio: 'Passionate mechanical modeler crafting lightweight carbon-fiber chassis, harmonic drive gearboxes, and stress-tested robotic appendages.',
          skills: JSON.stringify(['SolidWorks', 'Fusion 360', 'FEA Analysis', '3D Printing (FDM/SLA)', 'CNC Machining']),
          display_order: 5
        }
      ];

      for (const m of c1Members) {
        await runQuery(
          `INSERT INTO committee_members (committee_id, name, email, department, student_id, designation, category, is_override, profile_photo, bio, skills, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            res1.id, m.name, m.email, m.department, m.student_id, m.designation,
            m.category, m.is_override, m.profile_photo, m.bio, m.skills, m.display_order
          ]
        );
      }

      // Seed members for Committee #2
      const c2Members = [
        {
          name: 'Prof. Dr. M. K. Alam',
          email: 'admin@jstu.edu',
          department: 'Computer Science & Engineering',
          student_id: 'FAC-JSTU-01',
          designation: 'Chief Technical Director & Faculty Advisor',
          category: 'Advisor',
          is_override: 0,
          profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bio: 'Advising and mentoring club activities for the 2026-2027 tenure.',
          skills: JSON.stringify(['Robotics Architecture', 'Control Systems']),
          display_order: 1
        },
        {
          name: 'Sadia Afrin',
          email: 'member@jstu.edu',
          department: 'Electrical & Electronic Engineering',
          student_id: 'JSTU-EEE-2144',
          designation: 'President & Executive Lead',
          category: 'Executive',
          is_override: 0,
          profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          bio: 'Leading club administrative, academic, and inter-university tournament operations.',
          skills: JSON.stringify(['Leadership', 'Embedded Electronics', 'Hardware Prototyping']),
          display_order: 2
        },
        {
          name: 'Fahim Morshed',
          email: 'fahim@jstu.edu',
          department: 'Computer Science & Engineering',
          student_id: 'JSTU-CSE-2208',
          designation: 'Vice President & Autonomy Research Head',
          category: 'Executive',
          is_override: 0,
          profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          bio: 'Overseeing autonomous rover research and software pipelines.',
          skills: JSON.stringify(['PyTorch', 'SLAM', 'ROS2']),
          display_order: 3
        },
        {
          name: 'Anika Tabassum',
          email: 'anika@jstu.edu',
          department: 'Mechanical Engineering',
          student_id: 'JSTU-ME-2215',
          designation: 'General Secretary & Fabrication Head',
          category: 'Executive',
          is_override: 0,
          profile_photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
          bio: 'Directing mechanical manufacturing, rapid prototyping, and chassis validation.',
          skills: JSON.stringify(['SolidWorks', 'CAD/CAM', 'FEA']),
          display_order: 4
        }
      ];

      for (const m of c2Members) {
        await runQuery(
          `INSERT INTO committee_members (committee_id, name, email, department, student_id, designation, category, is_override, profile_photo, bio, skills, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            res2.id, m.name, m.email, m.department, m.student_id, m.designation,
            m.category, m.is_override, m.profile_photo, m.bio, m.skills, m.display_order
          ]
        );
      }

      console.log('🌱 Seeded Committee #1 and Committee #2 with categorized members');
    }
  } catch (err) {
    console.error('❌ Error during initial data seeding:', err);
  }
}

// Ensure Master Admin account exists with user-specified credentials and purge legacy demo accounts
async function ensureMasterAdmin() {
  try {
    const adminEmail = 'jsturoboticsclub@gmail.com';
    const adminPassPlain = '@@2017JSTURC2017@@';
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(adminPassPlain, salt);

    const existingAdmin = await getQuery('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [adminEmail]);
    if (!existingAdmin) {
      await runQuery(
        `INSERT INTO users (
          email, password_hash, name, role, status, committee_role, department,
          bio, skills, profile_photo, contact_links, project_contributions
        ) VALUES (
          ?, ?, 'JSTU Robotics Club Admin', 'Admin', 'approved', 'Chief Administrator', 'Robotics & Automation',
          'Official Administrator of the Jamalpur Science and Technology University Robotics Club.',
          ?, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          ?, ?
        )`,
        [
          adminEmail,
          newHash,
          JSON.stringify(['Administration', 'Robotics Systems', 'Leadership']),
          JSON.stringify({ email: adminEmail }),
          JSON.stringify(['Club Administration'])
        ]
      );
      console.log(`🔐 Master Admin account created: ${adminEmail}`);
    } else {
      await runQuery("UPDATE users SET password_hash = ?, role = 'Admin', status = 'approved' WHERE LOWER(email) = LOWER(?)", [newHash, adminEmail]);
      console.log(`🔐 Master Admin credentials updated: ${adminEmail}`);
    }

    // Permanently remove legacy demo accounts so no one can manipulate
    await runQuery("DELETE FROM users WHERE LOWER(email) IN ('admin@jstu.edu', 'member@jstu.edu')");
    await runQuery("DELETE FROM committee_members WHERE LOWER(email) IN ('admin@jstu.edu', 'member@jstu.edu')");
    console.log('🧹 Purged legacy demo accounts (admin@jstu.edu, member@jstu.edu)');
  } catch (err) {
    console.error('❌ Error ensuring master admin:', err);
  }
}

// Ensure active registered members and Committee #2 are always preserved across reboots & deployments
async function ensureRegisteredMembers() {
  try {
    // 1. Ensure Committee #2 exists and is marked current
    let c2 = await getQuery('SELECT * FROM committees WHERE committee_number = 2');
    if (!c2) {
      const res = await runQuery(
        `INSERT INTO committees (committee_number, title, session_years, is_current, theme_motto, description)
         VALUES (2, '2nd Executive Committee', '2026–2027', 1, 'Swarm Intelligence & Aerial Autonomy Scale', 'The incoming executive tenure advancing swarm drone platforms, multi-agent SLAM algorithms, and hosting the regional university robotics symposium.')`
      );
      c2 = { id: res.id };
    }
    await runQuery('UPDATE committees SET is_current = 1 WHERE committee_number = 2');
    await runQuery('UPDATE committees SET is_current = 0 WHERE committee_number != 2');

    const defaultPasswordHash = await bcrypt.hash('@@2017JSTURC2017@@', 10);

    const membersToPreserve = [
      {
        name: 'M. Miyad Islam Nion',
        email: 'miyadislam316@gmail.com',
        role: 'Admin',
        status: 'approved',
        committee_role: 'Director',
        department: 'Robotics & Engineering',
        student_id: 'JSTU-EEE-20111221',
        bio: `I am an Electrical and Electronic Engineering (EEE) student at JSTU, currently serving as the Director of the JSTU Robotics Club and IEEE Vice Chair. My technical passion lies at the intersection of embedded systems, Internet of Things (IoT), and artificial intelligence.\n\nKey Contributions:\n\nHardware & IoT Development: Designed and programmed multi-sensor embedded systems using ESP32 and Arduino microcontrollers, integrating environmental sensors (PIR, flame, gas, water-level) with relays and alarms for real-time monitoring and automation.\n\nAI & Power Systems Research: Developed and modeled power electronics and microgrid systems using MATLAB Simscape. Currently researching smart grid cyber-attack detection utilizing explainable AI and Graph Neural Networks (GCN/GAT).\n\nProject Innovation: Designed the "Jamalpur GreenLoop" off-grid hybrid microgrid concept and continuously work to bridge software solutions (Python, Django) with hardware implementations.\n\nClub Leadership: As Club Director, I help lead hardware innovation on campus and spearheaded the deployment of the official JSTURC web platform to showcase our members' work.`,
        skills: JSON.stringify([
          'Python', 'Machine Learning (GNNs)', 'ESP32', 'Arduino Uno',
          'Hardware Integration', 'IoT Systems', 'Firmware Development',
          'Circuit Design', 'MATLAB & Simulink', 'Wokwi Simulation', 'Embedded Systems'
        ]),
        profile_photo: 'https://lh3.googleusercontent.com/a/ACg8ocJWUFxpXB2JMP6REaai9qYrJflsSQGeeKg3woIepgb89A5H1bdI=s96-c',
        contact_links: JSON.stringify({
          email: 'miyadislam316@gmail.com',
          github: 'https://github.com/miyad-islam',
          linkedin: 'https://www.linkedin.com/in/miyad-islam'
        }),
        designation: 'Director',
        category: 'Executive',
        display_order: 1
      },
      {
        name: 'Abdullah Al Minhaz',
        email: 'abdullahalminhaz14@gmail.com',
        role: 'Admin',
        status: 'approved',
        committee_role: 'President',
        department: 'Robotics & Engineering',
        student_id: '',
        bio: 'President of the JSTU Robotics Club for the 2026–2027 tenure. Leading student research initiatives, inter-university competitive robotics tournaments, and multi-agent autonomous lab deployments.',
        skills: JSON.stringify(['Robotics Enthusiast', 'Strategic Leadership', 'Project Architecture', 'Competitive Robotics']),
        profile_photo: 'https://lh3.googleusercontent.com/a/ACg8ocKKWfqbrpYTgzKTXN8aRY4rKG1V-6l5kvKisw7RMR_GODTS-7n2=s96-c',
        contact_links: JSON.stringify({ email: 'abdullahalminhaz14@gmail.com' }),
        designation: 'President',
        category: 'Executive',
        display_order: 2
      },
      {
        name: 'Md.Umar Faruk',
        email: 'umarfarukhridoy28@gmail.com',
        role: 'Member',
        status: 'approved',
        committee_role: 'Secretary',
        department: 'Electrical & Electronic Engineering',
        student_id: 'JSTU -EEE-03',
        bio: `Robotics Enthusiast | Automation & AI\nExploring Robotics, Embedded Systems & Intelligent Machines\nTurning Ideas into Innovative Solutions\nPassionate about Technology, Research & Future Innovation.`,
        skills: JSON.stringify([
          'Arduino', 'MATLAB', 'AutoCAD', 'C', 'Python', 'Robotics',
          'Automation', 'Embedded Systems', 'Artificial Intelligence',
          'Machine Learning', 'IoT', 'Electrical Circuit Design etc.'
        ]),
        profile_photo: 'https://api.dicebear.com/7.x/bottts/svg?seed=Md.Umar%20Faruk',
        contact_links: JSON.stringify({ email: 'umarfarukhridoy28@gmail.com' }),
        designation: 'Secretary',
        category: 'Executive',
        display_order: 3
      },
      {
        name: 'Md. Khabir Uddin Ahamed',
        email: 'khabir.cse@jstu.ac.bd',
        role: 'Member',
        status: 'approved',
        committee_role: 'Executive Member',
        department: 'CSE',
        student_id: 'JSTU-CSE-12',
        bio: 'Robotics & Automation Enthusiast | Active Member of JSTU Robotics Club. Passionate about embedded systems, microcontroller firmware, and hardware prototyping.',
        skills: JSON.stringify(['Arduino', 'C++', 'Python', 'Embedded Systems', 'Robotics', 'Circuit Design']),
        profile_photo: 'https://api.dicebear.com/7.x/bottts/svg?seed=Md.%20Khabir%20Uddin%20Ahamed',
        contact_links: JSON.stringify({ email: 'khabiruddin.jstu@gmail.com' }),
        designation: 'Executive Member',
        category: 'Member',
        display_order: 5
      },
      {
        name: 'Nandita Saha Nishi',
        email: 'nandita99saha@gmail.com',
        role: 'Member',
        status: 'approved',
        committee_role: 'Executive Member',
        department: 'Electrical & Electronic Engineering',
        student_id: 'JSTU-EEE-22211231',
        bio: 'Passionate about gathering knowledge in robotics, artificial intelligence, and embedded systems.',
        skills: JSON.stringify(['Arduino', 'Python', 'ML', 'DL', 'AutoCAD', 'MATLAB']),
        profile_photo: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nandita%20Saha%20Nishi%20',
        contact_links: JSON.stringify({ email: 'nandita99saha@gmail.com' }),
        designation: 'Executive Member',
        category: 'Member',
        display_order: 6
      }
    ];

    for (const m of membersToPreserve) {
      let user = await getQuery('SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?) OR (LOWER(name) LIKE \'%khabir%\' AND ? LIKE \'%khabir%\')', [m.email, m.name, m.name]);
      if (!user) {
        const res = await runQuery(
          `INSERT INTO users (name, email, password_hash, role, status, committee_role, department, student_id, bio, skills, profile_photo, contact_links, project_contributions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]')`,
          [m.name, m.email, defaultPasswordHash, m.role, m.status, m.committee_role, m.department, m.student_id, m.bio, m.skills, m.profile_photo, m.contact_links]
        );
        user = { id: res.id };
      }

      const cm = await getQuery('SELECT id FROM committee_members WHERE committee_id = ? AND (LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?) OR (LOWER(name) LIKE \'%khabir%\' AND ? LIKE \'%khabir%\'))', [c2.id, m.email, m.name, m.name]);
      if (!cm) {
        await runQuery(
          `INSERT INTO committee_members (committee_id, user_id, name, email, department, student_id, designation, category, is_override, profile_photo, bio, skills, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
          [c2.id, user.id, m.name, m.email, m.department, m.student_id, m.designation, m.category, m.profile_photo, m.bio, m.skills, m.display_order]
        );
      } else {
        await runQuery(
          `UPDATE committee_members
           SET user_id = COALESCE(user_id, ?)
           WHERE id = ?`,
          [user.id, cm.id]
        );
      }
    }
    console.log('✅ Verified & preserved all active registered members and Committee #2');
  } catch (err) {
    console.error('❌ Error preserving registered members:', err);
  }
}

// Automatic member category deduction helper
function inferMemberCategory(roleTitle) {
  if (!roleTitle) return 'Member';
  const lower = roleTitle.toLowerCase();
  if (lower.includes('advisor') || lower.includes('director') || lower.includes('mentor') || lower.includes('patron')) {
    return 'Advisor';
  }
  if (lower.includes('president') || lower.includes('vice') || lower.includes('secretary') || lower.includes('treasurer') || lower.includes('organizing') || lower.includes('excom') || lower.includes('chair')) {
    return 'Executive';
  }
  if (lower.includes('lead') || lower.includes('head') || lower.includes('coordinator') || lower.includes('manager') || lower.includes('specialist') || lower.includes('architect')) {
    return 'Lead';
  }
  return 'Member';
}

module.exports = {
  db,
  runQuery,
  getQuery,
  allQuery,
  inferMemberCategory
};
