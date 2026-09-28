const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@libsql/client');

const TURSO_URL = process.env.TURSO_DATABASE_URL || process.env.TURSO_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be defined in your .env file.');
  process.exit(1);
}

const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN
});

const localDbPath = path.join(__dirname, '..', 'data', 'jstu_robotics.db');
const localDb = new sqlite3.Database(localDbPath);

function getLocalRows(sql) {
  return new Promise((resolve, reject) => {
    localDb.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function migrate() {
  console.log('🚀 Starting Turso Schema & Data Migration...');

  // 1. Create Tables
  console.log('📦 Creating tables in Turso...');

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS users (
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
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      section TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      meta_json TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS projects (
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
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS agenda_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT,
      badge TEXT,
      order_num INTEGER DEFAULT 0
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS directory_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      priority INTEGER DEFAULT 0,
      category TEXT DEFAULT 'Executive'
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT DEFAULT 'normal',
      author_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS committees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      committee_number INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      session_years TEXT NOT NULL,
      is_current INTEGER DEFAULT 0,
      theme_motto TEXT,
      description TEXT,
      banner_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS committee_members (
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
    )
  `);

  console.log('✅ Tables created successfully!');

  // Helper to migrate table data
  async function migrateTable(tableName, idCol = 'id') {
    const rows = await getLocalRows(`SELECT * FROM ${tableName}`);
    if (!rows.length) return;
    console.log(`⏳ Migrating ${rows.length} rows for table: ${tableName}...`);

    for (const row of rows) {
      const keys = Object.keys(row);
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => row[k]);
      const sql = `INSERT OR REPLACE INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
      await turso.execute({ sql, args: values });
    }
    console.log(`✅ Table ${tableName} migrated! (${rows.length} rows)`);
  }

  await migrateTable('users');
  await migrateTable('site_content', 'key');
  await migrateTable('projects');
  await migrateTable('agenda_items');
  await migrateTable('directory_roles');
  await migrateTable('announcements');
  await migrateTable('committees');
  await migrateTable('committee_members');

  console.log('\n🎉 ALL DATA HAS BEEN MIGRATED TO TURSO CLOUD SUCCESSFULLY!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
