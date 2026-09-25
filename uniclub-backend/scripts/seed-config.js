const db = require('../db');

const defaultConfig = {
  hero_cta_primary: { text: 'Apply for Membership', link: '#join', show: true },
  hero_cta_secondary: { text: 'Explore Active Bots', link: '#projects', show: true },
  hero_cta_tertiary: { text: 'Member Directory', link: '#directory', show: true },
  sections: {
    agenda: { title: 'Club Agenda & Research Pillars', subtitle: 'Strategic Blueprint', show: true },
    projects: { title: 'Featured Robotics Projects', subtitle: 'Engineering Feats', show: true },
    directory: { title: 'Committee & Member Directory', subtitle: 'Team & Community', show: true },
    join: { title: 'Join the JSTU Robotics Club', subtitle: 'Recruitment 2026', show: true }
  },
  project_categories: ['All', 'Autonomous Terrestrial', 'Aerial Robotics', 'Biomimetic Walking Robots', 'Competitive Robotics'],
  directory_categories: ['All', 'Executive', 'Leads']
};

async function run() {
  const existing = await db.getQuery("SELECT key FROM site_content WHERE key = 'site_config'");
  if (!existing) {
    await db.runQuery(
      "INSERT INTO site_content (key, section, title, content, meta_json) VALUES ('site_config', 'system', 'Master Configuration', 'Master Site Configuration', ?)",
      [JSON.stringify(defaultConfig)]
    );
    console.log('✅ Site config seeded successfully!');
  } else {
    console.log('✅ Site config already present.');
  }
}

run().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
