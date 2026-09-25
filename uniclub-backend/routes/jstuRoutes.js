const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery, getQuery, allQuery, inferMemberCategory } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'jstu_robotics_club_jwt_secret_2026';

// Middleware to authenticate JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access token required' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// Middleware to require Admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Administrator privileges required' });
  }
  next();
};

// ==========================================
// 1. PUBLIC LANDING PAGE & DIRECTORY ROUTES
// ==========================================

// GET /api/site-content: Fetch all dynamic landing page content items
router.get('/site-content', async (req, res) => {
  try {
    const rows = await allQuery('SELECT * FROM site_content');
    const contentMap = {};
    for (const row of rows) {
      let meta = {};
      try {
        meta = row.meta_json ? JSON.parse(row.meta_json) : {};
      } catch (e) {
        meta = {};
      }
      contentMap[row.key] = {
        key: row.key,
        section: row.section,
        title: row.title,
        content: row.content,
        meta: meta,
        updated_at: row.updated_at
      };
    }
    res.json({ success: true, data: contentMap });
  } catch (err) {
    console.error('Error fetching site content:', err);
    res.status(500).json({ error: 'Failed to fetch site content' });
  }
});

// GET /api/members: Public committee & member directory (supports ?committee_id=X or current active committee)
router.get('/members', async (req, res) => {
  try {
    const committeeId = req.query.committee_id;
    let targetCommittee = null;

    if (committeeId) {
      targetCommittee = await getQuery('SELECT * FROM committees WHERE id = ? OR committee_number = ?', [committeeId, committeeId]);
    } else {
      targetCommittee = await getQuery('SELECT * FROM committees WHERE is_current = 1');
      if (!targetCommittee) {
        targetCommittee = await getQuery('SELECT * FROM committees ORDER BY committee_number DESC LIMIT 1');
      }
    }

    let members = [];

    // Auto-link any committee_members whose email matches an approved user in users table
    try {
      await runQuery(`
        UPDATE committee_members
        SET user_id = (SELECT u.id FROM users u WHERE LOWER(u.email) = LOWER(committee_members.email) LIMIT 1)
        WHERE user_id IS NULL AND email IS NOT NULL AND email != ''
          AND EXISTS (SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(committee_members.email))
      `);
    } catch (e) {
      // non-blocking
    }

    if (targetCommittee) {
      const cmRows = await allQuery(`
        SELECT cm.id, cm.committee_id,
               COALESCE(cm.user_id, u.id) as user_id,
               CASE WHEN cm.is_override = 1 THEN cm.name ELSE COALESCE(u.name, cm.name) END as name,
               COALESCE(u.email, cm.email) as email,
               CASE WHEN cm.is_override = 1 THEN cm.department ELSE COALESCE(u.department, cm.department) END as department,
               COALESCE(u.student_id, cm.student_id) as student_id,
               cm.designation as committee_role,
               cm.category,
               cm.is_override,
               CASE 
                 WHEN cm.profile_photo IS NOT NULL AND cm.profile_photo != '' AND cm.profile_photo NOT LIKE '%api.dicebear.com%' THEN cm.profile_photo
                 WHEN u.profile_photo IS NOT NULL AND u.profile_photo != '' AND u.profile_photo NOT LIKE '%api.dicebear.com%' THEN u.profile_photo
                 WHEN cm.profile_photo IS NOT NULL AND cm.profile_photo != '' THEN cm.profile_photo
                 WHEN u.profile_photo IS NOT NULL AND u.profile_photo != '' THEN u.profile_photo
                 ELSE NULL 
               END as profile_photo,
               CASE WHEN cm.is_override = 1 THEN cm.bio ELSE COALESCE(NULLIF(u.bio, ''), cm.bio) END as bio,
               CASE WHEN cm.is_override = 1 THEN cm.skills ELSE COALESCE(NULLIF(u.skills, ''), cm.skills) END as skills,
               CASE WHEN cm.is_override = 1 THEN cm.social_links ELSE COALESCE(NULLIF(u.contact_links, ''), cm.social_links) END as contact_links,
               cm.display_order,
               COALESCE(u.role, CASE WHEN cm.category = 'Executive' OR cm.category = 'Advisor' THEN 'Executive' ELSE 'Member' END) as role,
               u.project_contributions
        FROM committee_members cm
        LEFT JOIN users u ON (cm.user_id = u.id OR (cm.email IS NOT NULL AND cm.email != '' AND LOWER(cm.email) = LOWER(u.email)))
        WHERE cm.committee_id = ?
        ORDER BY 
          CASE 
            WHEN cm.category = 'Advisor' THEN 1
            WHEN cm.category = 'Executive' THEN 2
            WHEN cm.category = 'Lead' THEN 3
            ELSE 4
          END,
          cm.display_order ASC,
          cm.id ASC
      `, [targetCommittee.id]);

      members = cmRows.map(m => {
        let skills = [];
        let contact_links = {};
        let project_contributions = [];
        try { skills = m.skills ? (typeof m.skills === 'string' ? JSON.parse(m.skills) : m.skills) : []; } catch (e) {}
        try { contact_links = m.contact_links ? (typeof m.contact_links === 'string' ? JSON.parse(m.contact_links) : m.contact_links) : {}; } catch (e) {}
        try { project_contributions = m.project_contributions ? (typeof m.project_contributions === 'string' ? JSON.parse(m.project_contributions) : m.project_contributions) : []; } catch (e) {}

        const finalCategory = m.category || inferMemberCategory(m.committee_role);

        return {
          ...m,
          skills,
          contact_links,
          project_contributions,
          category: finalCategory,
          committee_info: {
            id: targetCommittee.id,
            committee_number: targetCommittee.committee_number,
            title: targetCommittee.title,
            session_years: targetCommittee.session_years,
            is_current: targetCommittee.is_current
          }
        };
      });

      // Also append other approved users who are not in committee_members so newly registered members show up
      try {
        const otherApprovedUsers = await allQuery(`
          SELECT u.id as user_id, u.id, u.name, u.email, u.role, u.committee_role, u.department, u.student_id,
                 u.bio, u.skills, u.profile_photo, u.contact_links, u.project_contributions, u.created_at
          FROM users u
          WHERE u.status = 'approved'
            AND u.id NOT IN (SELECT COALESCE(user_id, 0) FROM committee_members WHERE committee_id = ?)
            AND LOWER(u.email) NOT IN (SELECT LOWER(COALESCE(email, '')) FROM committee_members WHERE committee_id = ?)
          ORDER BY u.id ASC
        `, [targetCommittee.id, targetCommittee.id]);

        const otherMembers = otherApprovedUsers.map(u => {
          let skills = [];
          let contact_links = {};
          let project_contributions = [];
          try { skills = u.skills ? JSON.parse(u.skills) : []; } catch (e) {}
          try { contact_links = u.contact_links ? JSON.parse(u.contact_links) : {}; } catch (e) {}
          try { project_contributions = u.project_contributions ? JSON.parse(u.project_contributions) : []; } catch (e) {}

          return {
            id: u.id,
            committee_id: targetCommittee.id,
            user_id: u.id,
            name: u.name,
            email: u.email,
            department: u.department,
            student_id: u.student_id,
            committee_role: u.committee_role || 'Standard Member',
            category: 'Member',
            is_override: 0,
            profile_photo: u.profile_photo,
            bio: u.bio,
            skills,
            contact_links,
            display_order: 99,
            role: u.role || 'Member',
            project_contributions,
            committee_info: {
              id: targetCommittee.id,
              committee_number: targetCommittee.committee_number,
              title: targetCommittee.title,
              session_years: targetCommittee.session_years,
              is_current: targetCommittee.is_current
            }
          };
        });

        members = [...members, ...otherMembers];
      } catch (appendErr) {
        console.warn('Could not append extra members:', appendErr.message);
      }
    }

    // Fallback if committee_members table has no entries for target committee
    if (members.length === 0) {
      const rows = await allQuery(`
        SELECT u.id, u.name, u.email, u.role, u.committee_role, u.committee_category, u.department, u.student_id,
               u.bio, u.skills, u.profile_photo, u.contact_links, u.project_contributions, u.created_at
        FROM users u
        WHERE u.status = 'approved'
        ORDER BY 
          CASE 
            WHEN u.committee_role LIKE '%Director%' OR u.committee_role LIKE '%Advisor%' THEN 1
            WHEN u.committee_role LIKE '%President%' THEN 2
            WHEN u.committee_role LIKE '%Vice%' THEN 3
            WHEN u.committee_role LIKE '%Secretary%' THEN 4
            WHEN u.committee_role LIKE '%Lead%' THEN 5
            ELSE 6
          END,
          u.id ASC
      `);

      members = rows.map(m => {
        let skills = [];
        let contact_links = {};
        let project_contributions = [];
        try { skills = m.skills ? JSON.parse(m.skills) : []; } catch (e) {}
        try { contact_links = m.contact_links ? JSON.parse(m.contact_links) : {}; } catch (e) {}
        try { project_contributions = m.project_contributions ? JSON.parse(m.project_contributions) : []; } catch (e) {}

        const finalCategory = (m.committee_category && m.committee_category !== 'Auto')
          ? m.committee_category
          : inferMemberCategory(m.committee_role);

        return {
          ...m,
          skills,
          contact_links,
          project_contributions,
          category: finalCategory
        };
      });
    }

    res.json({ 
      success: true, 
      count: members.length, 
      current_committee: targetCommittee, 
      data: members 
    });
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET /api/committees: List all committees with members count and leadership
router.get('/committees', async (req, res) => {
  try {
    const committees = await allQuery(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM committee_members cm WHERE cm.committee_id = c.id) as total_members_count,
        (SELECT name FROM committee_members cm WHERE cm.committee_id = c.id AND cm.designation LIKE '%President%' LIMIT 1) as president_name,
        (SELECT name FROM committee_members cm WHERE cm.committee_id = c.id AND (cm.category = 'Advisor' OR cm.designation LIKE '%Advisor%') LIMIT 1) as advisor_name
      FROM committees c
      ORDER BY c.committee_number DESC
    `);
    res.json({ success: true, count: committees.length, data: committees });
  } catch (err) {
    console.error('Error fetching committees:', err);
    res.status(500).json({ error: 'Failed to fetch committees' });
  }
});

// GET /api/committees/current: Active running committee
router.get('/committees/current', async (req, res) => {
  try {
    let committee = await getQuery('SELECT * FROM committees WHERE is_current = 1');
    if (!committee) {
      committee = await getQuery('SELECT * FROM committees ORDER BY committee_number DESC LIMIT 1');
    }
    if (!committee) {
      return res.status(404).json({ error: 'No active committee found' });
    }

    const members = await allQuery(`
      SELECT cm.id, cm.committee_id,
             COALESCE(cm.user_id, u.id) as user_id,
             CASE WHEN cm.is_override = 1 THEN cm.name ELSE COALESCE(u.name, cm.name) END as name,
             COALESCE(u.email, cm.email) as email,
             CASE WHEN cm.is_override = 1 THEN cm.department ELSE COALESCE(u.department, cm.department) END as department,
             COALESCE(u.student_id, cm.student_id) as student_id,
             cm.designation,
             cm.category,
             cm.is_override,
             CASE 
               WHEN cm.profile_photo IS NOT NULL AND cm.profile_photo != '' AND cm.profile_photo NOT LIKE '%api.dicebear.com%' THEN cm.profile_photo
               WHEN u.profile_photo IS NOT NULL AND u.profile_photo != '' AND u.profile_photo NOT LIKE '%api.dicebear.com%' THEN u.profile_photo
               WHEN cm.profile_photo IS NOT NULL AND cm.profile_photo != '' THEN cm.profile_photo
               WHEN u.profile_photo IS NOT NULL AND u.profile_photo != '' THEN u.profile_photo
               ELSE NULL 
             END as profile_photo,
             CASE WHEN cm.is_override = 1 THEN cm.bio ELSE COALESCE(NULLIF(u.bio, ''), cm.bio) END as bio,
             CASE WHEN cm.is_override = 1 THEN cm.skills ELSE COALESCE(NULLIF(u.skills, ''), cm.skills) END as skills,
             CASE WHEN cm.is_override = 1 THEN cm.social_links ELSE COALESCE(NULLIF(u.contact_links, ''), cm.social_links) END as social_links,
             cm.display_order,
             COALESCE(u.role, CASE WHEN cm.category = 'Executive' OR cm.category = 'Advisor' THEN 'Executive' ELSE 'Member' END) as system_role
      FROM committee_members cm
      LEFT JOIN users u ON (cm.user_id = u.id OR (cm.email IS NOT NULL AND cm.email != '' AND LOWER(cm.email) = LOWER(u.email)))
      WHERE cm.committee_id = ?
      ORDER BY 
        CASE 
          WHEN cm.category = 'Advisor' THEN 1
          WHEN cm.category = 'Executive' THEN 2
          WHEN cm.category = 'Lead' THEN 3
          ELSE 4
        END,
        cm.display_order ASC,
        cm.id ASC
    `, [committee.id]);

    const parsedMembers = members.map(m => {
      let skills = [];
      let social_links = {};
      try { skills = m.skills ? (typeof m.skills === 'string' ? JSON.parse(m.skills) : m.skills) : []; } catch (e) {}
      try { social_links = m.social_links ? (typeof m.social_links === 'string' ? JSON.parse(m.social_links) : m.social_links) : {}; } catch (e) {}
      return { ...m, skills, social_links };
    });

    res.json({
      success: true,
      committee,
      members: parsedMembers,
      counts: {
        total: parsedMembers.length,
        executive: parsedMembers.filter(m => m.category === 'Executive').length,
        leads: parsedMembers.filter(m => m.category === 'Lead').length,
        advisors: parsedMembers.filter(m => m.category === 'Advisor').length,
        members: parsedMembers.filter(m => m.category === 'Member').length
      }
    });
  } catch (err) {
    console.error('Error fetching current committee:', err);
    res.status(500).json({ error: 'Failed to fetch current committee' });
  }
});

// GET /api/committees/:id: Specific committee details and categorized members
router.get('/committees/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const committee = await getQuery(
      'SELECT * FROM committees WHERE id = ? OR committee_number = ?',
      [id, id]
    );

    if (!committee) {
      return res.status(404).json({ error: 'Committee not found' });
    }

    const members = await allQuery(`
      SELECT cm.id, cm.committee_id,
             COALESCE(cm.user_id, u.id) as user_id,
             CASE WHEN cm.is_override = 1 THEN cm.name ELSE COALESCE(u.name, cm.name) END as name,
             COALESCE(u.email, cm.email) as email,
             CASE WHEN cm.is_override = 1 THEN cm.department ELSE COALESCE(u.department, cm.department) END as department,
             COALESCE(u.student_id, cm.student_id) as student_id,
             cm.designation,
             cm.category,
             cm.is_override,
             CASE 
               WHEN cm.profile_photo IS NOT NULL AND cm.profile_photo != '' AND cm.profile_photo NOT LIKE '%api.dicebear.com%' THEN cm.profile_photo
               WHEN u.profile_photo IS NOT NULL AND u.profile_photo != '' AND u.profile_photo NOT LIKE '%api.dicebear.com%' THEN u.profile_photo
               WHEN cm.profile_photo IS NOT NULL AND cm.profile_photo != '' THEN cm.profile_photo
               WHEN u.profile_photo IS NOT NULL AND u.profile_photo != '' THEN u.profile_photo
               ELSE NULL 
             END as profile_photo,
             CASE WHEN cm.is_override = 1 THEN cm.bio ELSE COALESCE(NULLIF(u.bio, ''), cm.bio) END as bio,
             CASE WHEN cm.is_override = 1 THEN cm.skills ELSE COALESCE(NULLIF(u.skills, ''), cm.skills) END as skills,
             CASE WHEN cm.is_override = 1 THEN cm.social_links ELSE COALESCE(NULLIF(u.contact_links, ''), cm.social_links) END as social_links,
             cm.display_order,
             COALESCE(u.role, CASE WHEN cm.category = 'Executive' OR cm.category = 'Advisor' THEN 'Executive' ELSE 'Member' END) as system_role
      FROM committee_members cm
      LEFT JOIN users u ON (cm.user_id = u.id OR (cm.email IS NOT NULL AND cm.email != '' AND LOWER(cm.email) = LOWER(u.email)))
      WHERE cm.committee_id = ?
      ORDER BY 
        CASE 
          WHEN cm.category = 'Advisor' THEN 1
          WHEN cm.category = 'Executive' THEN 2
          WHEN cm.category = 'Lead' THEN 3
          ELSE 4
        END,
        cm.display_order ASC,
        cm.id ASC
    `, [committee.id]);

    const parsedMembers = members.map(m => {
      let skills = [];
      let social_links = {};
      try { skills = m.skills ? (typeof m.skills === 'string' ? JSON.parse(m.skills) : m.skills) : []; } catch (e) {}
      try { social_links = m.social_links ? (typeof m.social_links === 'string' ? JSON.parse(m.social_links) : m.social_links) : {}; } catch (e) {}
      return { ...m, skills, social_links };
    });

    res.json({
      success: true,
      committee,
      members: parsedMembers,
      counts: {
        total: parsedMembers.length,
        executive: parsedMembers.filter(m => m.category === 'Executive').length,
        leads: parsedMembers.filter(m => m.category === 'Lead').length,
        advisors: parsedMembers.filter(m => m.category === 'Advisor').length,
        members: parsedMembers.filter(m => m.category === 'Member').length
      }
    });
  } catch (err) {
    console.error('Error fetching committee details:', err);
    res.status(500).json({ error: 'Failed to fetch committee details' });
  }
});

// GET /api/members/:id: Dynamic member profile page details (supports user ID, committee member ID, or student ID)
router.get('/members/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    if (!rawId || rawId === 'null' || rawId === 'undefined') {
      return res.status(404).json({ error: 'Invalid member identifier' });
    }

    let member = null;
    const isNum = !isNaN(rawId);

    // 1. Try finding in users table by user ID
    if (isNum) {
      member = await getQuery(
        `SELECT u.id, u.name, u.email, u.role, u.status, u.committee_role, u.department, u.student_id,
                u.bio, u.skills, u.profile_photo, u.contact_links, u.project_contributions, u.created_at,
                cm.designation as cm_designation, cm.category as cm_category
         FROM users u
         LEFT JOIN committee_members cm ON (cm.user_id = u.id OR (cm.email IS NOT NULL AND cm.email != '' AND LOWER(cm.email) = LOWER(u.email)))
         WHERE u.id = ?`,
        [parseInt(rawId, 10)]
      );

      if (member && member.cm_designation) {
        member.committee_role = member.cm_designation;
      }
    }

    // 2. If not found by user ID, try finding in committee_members table by cm.id
    if (!member && isNum) {
      const cm = await getQuery(
        `SELECT cm.*, u.id as user_actual_id, u.role as user_role, u.status as user_status,
                u.bio as user_bio, u.skills as user_skills, u.profile_photo as user_photo,
                u.contact_links as user_links, u.project_contributions as user_projects,
                u.name as user_actual_name, u.department as user_dept, u.student_id as user_student_id
         FROM committee_members cm
         LEFT JOIN users u ON (cm.user_id = u.id OR (cm.email IS NOT NULL AND cm.email != '' AND LOWER(cm.email) = LOWER(u.email)))
         WHERE cm.id = ?`,
        [parseInt(rawId, 10)]
      );

      if (cm) {
        member = {
          id: cm.user_actual_id || cm.id,
          name: (cm.is_override === 1) ? cm.name : (cm.user_actual_name || cm.name),
          email: cm.email,
          role: cm.user_role || (cm.category === 'Executive' || cm.category === 'Advisor' ? 'Executive' : 'Member'),
          status: cm.user_status || 'approved',
          committee_role: cm.designation,
          department: (cm.is_override === 1) ? cm.department : (cm.user_dept || cm.department),
          student_id: cm.user_student_id || cm.student_id,
          bio: (cm.is_override === 1 || !cm.user_bio) ? cm.bio : cm.user_bio,
          skills: (cm.is_override === 1 || !cm.user_skills) ? cm.skills : cm.user_skills,
          profile_photo: ((cm.profile_photo && !cm.profile_photo.includes('api.dicebear.com')) ? cm.profile_photo : (cm.user_photo && !cm.user_photo.includes('api.dicebear.com')) ? cm.user_photo : (cm.profile_photo || cm.user_photo || '')),
          contact_links: (cm.is_override === 1 || !cm.user_links) ? cm.social_links : cm.user_links,
          project_contributions: cm.user_projects || '[]',
          created_at: cm.created_at
        };
      }
    }

    // 3. Try finding in users by student_id or email
    if (!member) {
      member = await getQuery(
        `SELECT u.id, u.name, u.email, u.role, u.status, u.committee_role, u.department, u.student_id,
                u.bio, u.skills, u.profile_photo, u.contact_links, u.project_contributions, u.created_at,
                cm.designation as cm_designation
         FROM users u
         LEFT JOIN committee_members cm ON (cm.user_id = u.id OR (cm.email IS NOT NULL AND cm.email != '' AND LOWER(cm.email) = LOWER(u.email)))
         WHERE LOWER(u.student_id) = LOWER(?) OR LOWER(u.email) = LOWER(?)`,
        [rawId, rawId]
      );
      if (member && member.cm_designation) {
        member.committee_role = member.cm_designation;
      }
    }

    // 4. Also try committee_members by student_id or email
    if (!member) {
      const cm = await getQuery(
        `SELECT cm.*, u.id as user_actual_id, u.role as user_role, u.status as user_status,
                u.bio as user_bio, u.skills as user_skills, u.profile_photo as user_photo,
                u.contact_links as user_links, u.project_contributions as user_projects,
                u.name as user_actual_name, u.department as user_dept, u.student_id as user_student_id
         FROM committee_members cm
         LEFT JOIN users u ON (cm.user_id = u.id OR (cm.email IS NOT NULL AND cm.email != '' AND LOWER(cm.email) = LOWER(u.email)))
         WHERE LOWER(cm.student_id) = LOWER(?) OR LOWER(cm.email) = LOWER(?)`,
        [rawId, rawId]
      );
      if (cm) {
        member = {
          id: cm.user_actual_id || cm.id,
          name: (cm.is_override === 1) ? cm.name : (cm.user_actual_name || cm.name),
          email: cm.email,
          role: cm.user_role || (cm.category === 'Executive' || cm.category === 'Advisor' ? 'Executive' : 'Member'),
          status: cm.user_status || 'approved',
          committee_role: cm.designation,
          department: (cm.is_override === 1) ? cm.department : (cm.user_dept || cm.department),
          student_id: cm.user_student_id || cm.student_id,
          bio: (cm.is_override === 1 || !cm.user_bio) ? cm.bio : cm.user_bio,
          skills: (cm.is_override === 1 || !cm.user_skills) ? cm.skills : cm.user_skills,
          profile_photo: ((cm.profile_photo && !cm.profile_photo.includes('api.dicebear.com')) ? cm.profile_photo : (cm.user_photo && !cm.user_photo.includes('api.dicebear.com')) ? cm.user_photo : (cm.profile_photo || cm.user_photo || '')),
          contact_links: (cm.is_override === 1 || !cm.user_links) ? cm.social_links : cm.user_links,
          project_contributions: cm.user_projects || '[]',
          created_at: cm.created_at
        };
      }
    }

    if (!member) {
      return res.status(404).json({ error: 'Member not found or not approved' });
    }

    let skills = [];
    let contact_links = {};
    let project_contributions = [];
    try { skills = member.skills ? (typeof member.skills === 'string' ? JSON.parse(member.skills) : member.skills) : []; } catch (e) {}
    try { contact_links = member.contact_links ? (typeof member.contact_links === 'string' ? JSON.parse(member.contact_links) : member.contact_links) : {}; } catch (e) {}
    try { project_contributions = member.project_contributions ? (typeof member.project_contributions === 'string' ? JSON.parse(member.project_contributions) : member.project_contributions) : []; } catch (e) {}

    // Fetch all committee tenures & sessions this member has served in
    let committee_history = [];
    try {
      committee_history = await allQuery(
        `SELECT c.id as committee_id, c.committee_number, c.title as committee_title,
                c.session_years, c.is_current, cm.designation, cm.category, cm.id as cm_id
         FROM committee_members cm
         JOIN committees c ON cm.committee_id = c.id
         WHERE (cm.user_id IS NOT NULL AND cm.user_id = ?)
            OR (cm.email IS NOT NULL AND cm.email != '' AND LOWER(cm.email) = LOWER(?))
            OR (? IS NOT NULL AND ? != '' AND LOWER(cm.name) = LOWER(?))
         ORDER BY c.committee_number DESC`,
        [member.id, member.email || '', member.name || '', member.name || '', member.name || '']
      );
    } catch (chErr) {
      console.warn('Error fetching committee history:', chErr.message);
    }

    res.json({
      success: true,
      data: {
        ...member,
        skills,
        contact_links,
        project_contributions,
        committee_history
      }
    });
  } catch (err) {
    console.error('Error fetching member detail:', err);
    res.status(500).json({ error: 'Failed to fetch member details' });
  }
});

// GET /api/projects: Robotics projects list (Public view: only approved projects)
router.get('/projects', async (req, res) => {
  try {
    const rows = await allQuery(
      "SELECT * FROM projects WHERE (approval_status = 'approved' OR approval_status IS NULL) AND status != 'Proposal Rejected' ORDER BY id DESC"
    );
    const projects = rows.map(p => {
      let tech_stack = [];
      let team_members = [];
      try { tech_stack = p.tech_stack ? JSON.parse(p.tech_stack) : []; } catch (e) {}
      try { team_members = p.team_members ? JSON.parse(p.team_members) : []; } catch (e) {}
      return { ...p, tech_stack, team_members };
    });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/agenda: Agenda milestones
router.get('/agenda', async (req, res) => {
  try {
    const rows = await allQuery('SELECT * FROM agenda_items ORDER BY order_num ASC, id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch agenda' });
  }
});

// GET /api/roles: Committee roles
router.get('/roles', async (req, res) => {
  try {
    const rows = await allQuery('SELECT * FROM directory_roles ORDER BY priority ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// ==========================================
// 2. AUTHENTICATION & REGISTRATION ROUTES
// ==========================================

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getQuery('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password. Please try again.' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({
        error: 'Your account is currently pending Admin approval. The club administration will activate your account soon.',
        pending: true
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Your membership application was not approved.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    let skills = [];
    let contact_links = {};
    try { skills = user.skills ? JSON.parse(user.skills) : []; } catch (e) {}
    try { contact_links = user.contact_links ? JSON.parse(user.contact_links) : {}; } catch (e) {}

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        committee_role: user.committee_role,
        department: user.department,
        student_id: user.student_id,
        bio: user.bio,
        skills,
        profile_photo: user.profile_photo,
        contact_links
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// POST /api/auth/google: Google Sign-In with automatic applicant registration & Admin Approval
router.post('/auth/google', async (req, res) => {
  try {
    const { credential, profile } = req.body;
    let email = '';
    let name = '';
    let picture = '';

    // Verify Google ID token if provided
    if (credential) {
      try {
        const https = require('https');
        const tokenInfo = await new Promise((resolve, reject) => {
          https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, (gRes) => {
            let body = '';
            gRes.on('data', chunk => body += chunk);
            gRes.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                if (parsed.email) resolve(parsed);
                else reject(new Error(parsed.error_description || 'Invalid Google token'));
              } catch (e) {
                reject(e);
              }
            });
          }).on('error', reject);
        });

        email = tokenInfo.email;
        name = tokenInfo.name || tokenInfo.email.split('@')[0];
        picture = tokenInfo.picture || '';
      } catch (tokenErr) {
        if (profile && profile.email) {
          email = profile.email;
          name = profile.name || profile.email.split('@')[0];
          picture = profile.picture || '';
        } else {
          return res.status(400).json({ error: 'Failed to verify Google identity credential' });
        }
      }
    } else if (profile && profile.email) {
      email = profile.email;
      name = profile.name;
      picture = profile.picture || '';
    } else {
      return res.status(400).json({ error: 'Google credential or profile required' });
    }

    if (!email) {
      return res.status(400).json({ error: 'No email associated with this Google account' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await getQuery('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    if (user) {
      // User exists - check their approval status
      if (user.status === 'pending') {
        return res.status(403).json({
          success: false,
          pending: true,
          error: 'Your Google account has been registered, but is currently pending Admin approval. The club administration will review and activate your membership soon.'
        });
      }

      if (user.status === 'rejected') {
        return res.status(403).json({
          success: false,
          error: 'Your membership application was not approved by the club committee.'
        });
      }

      // User is approved! Issue JWT session token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      let skills = [];
      let contact_links = {};
      try { skills = user.skills ? JSON.parse(user.skills) : []; } catch (e) {}
      try { contact_links = user.contact_links ? JSON.parse(user.contact_links) : {}; } catch (e) {}

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          committee_role: user.committee_role,
          department: user.department,
          student_id: user.student_id,
          bio: user.bio,
          skills,
          profile_photo: user.profile_photo || picture,
          contact_links
        }
      });
    }

    // FIRST TIME GOOGLE LOGIN: Register user as 'pending' for Admin approval
    const salt = await bcrypt.genSalt(10);
    const randomHash = await bcrypt.hash(Math.random().toString(36) + Date.now(), salt);
    const defaultAvatar = picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || cleanEmail)}`;

    await runQuery(
      `INSERT INTO users (
        email, password_hash, name, role, status, committee_role, department,
        bio, skills, profile_photo, contact_links, project_contributions
      ) VALUES (?, ?, ?, 'Member', 'pending', 'Applicant / Pending Member', 'Robotics & Engineering', ?, ?, ?, ?, ?)`,
      [
        cleanEmail,
        randomHash,
        name || 'JSTU Roboticist',
        'Registered with Google Account. Pending committee review.',
        JSON.stringify(['Robotics Enthusiast']),
        defaultAvatar,
        JSON.stringify({ email: cleanEmail }),
        JSON.stringify([])
      ]
    );

    return res.status(202).json({
      success: true,
      pending: true,
      message: `Welcome, ${name}! Your account has been registered with Google and is now submitted for Admin approval. The club committee will review and approve your membership shortly.`
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// POST /api/auth/register: Join the club
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, department, student_id, bio, skills } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await getQuery('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([skills || 'Robotics Enthusiast']);
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    const result = await runQuery(
      `INSERT INTO users (email, password_hash, name, role, status, committee_role, department, student_id, bio, skills, profile_photo, contact_links, project_contributions)
       VALUES (?, ?, ?, 'Member', 'pending', 'Applicant (Standard Member)', ?, ?, ?, ?, ?, ?, ?)`,
      [
        email.trim(),
        password_hash,
        name.trim(),
        department || 'Computer Science & Engineering',
        student_id || '',
        bio || 'New applicant eager to contribute to JSTU robotics projects.',
        skillsJson,
        defaultAvatar,
        JSON.stringify({ email: email.trim() }),
        JSON.stringify(['New Applicant'])
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Your account is pending committee approval.',
      userId: result.id
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/forgot-password: Generate password recovery code
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await getQuery('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email address' });
    }

    // Generate a 6-digit recovery code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Expiration: 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await runQuery(
      'INSERT INTO password_resets (email, code, expires_at, used) VALUES (?, ?, ?, 0)',
      [user.email, code, expiresAt]
    );

    res.json({
      success: true,
      message: 'Password recovery code generated successfully! Enter this code below to set a new password.',
      reset_code: code // Provided for instant self-service recovery in interface
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password recovery request' });
  }
});

// POST /api/auth/reset-password: Verify code and update password
router.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, new_password } = req.body;
    if (!email || !code || !new_password) {
      return res.status(400).json({ error: 'Email, recovery code, and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const resetRecord = await getQuery(
      `SELECT * FROM password_resets 
       WHERE LOWER(email) = LOWER(?) AND code = ? AND used = 0
       ORDER BY id DESC LIMIT 1`,
      [email.trim(), code.trim()]
    );

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid recovery code. Please check and try again.' });
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This recovery code has expired. Please request a new one.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    // Update user password
    await runQuery('UPDATE users SET password_hash = ? WHERE LOWER(email) = LOWER(?)', [newHash, email.trim()]);

    // Mark reset record as used
    await runQuery('UPDATE password_resets SET used = 1 WHERE id = ?', [resetRecord.id]);

    res.json({
      success: true,
      message: 'Password has been successfully updated! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Also support /auth/reset-password (without /api prefix if routed directly)
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { email, code, new_password } = req.body;
    if (!email || !code || !new_password) {
      return res.status(400).json({ error: 'Email, recovery code, and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const resetRecord = await getQuery(
      `SELECT * FROM password_resets 
       WHERE LOWER(email) = LOWER(?) AND code = ? AND used = 0
       ORDER BY id DESC LIMIT 1`,
      [email.trim(), code.trim()]
    );

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid recovery code. Please check and try again.' });
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This recovery code has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    await runQuery('UPDATE users SET password_hash = ? WHERE LOWER(email) = LOWER(?)', [newHash, email.trim()]);
    await runQuery('UPDATE password_resets SET used = 1 WHERE id = ?', [resetRecord.id]);

    res.json({
      success: true,
      message: 'Password has been successfully updated! You can now log in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// GET /api/users/me: Prevent legacy Mongoose timeout
router.get('/users/me', authenticate, async (req, res) => {
  try {
    const user = await getQuery(
      'SELECT id, name, email, role, status, committee_role, department, student_id, bio, skills, profile_photo, contact_links, project_contributions FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    let skills = [];
    let contact_links = {};
    try { skills = JSON.parse(user.skills); } catch (e) {}
    try { contact_links = JSON.parse(user.contact_links); } catch (e) {}
    res.json({
      success: true,
      user: { ...user, skills, contact_links }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me: Current user info
router.get('/auth/me', authenticate, async (req, res) => {
  try {
    const user = await getQuery(
      'SELECT id, name, email, role, status, committee_role, department, student_id, bio, skills, profile_photo, contact_links, project_contributions FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let skills = [];
    let contact_links = {};
    let project_contributions = [];
    try { skills = user.skills ? JSON.parse(user.skills) : []; } catch (e) {}
    try { contact_links = user.contact_links ? JSON.parse(user.contact_links) : {}; } catch (e) {}
    try { project_contributions = user.project_contributions ? JSON.parse(user.project_contributions) : []; } catch (e) {}

    res.json({
      success: true,
      user: {
        ...user,
        skills,
        contact_links,
        project_contributions
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

// ==========================================
// 3. MEMBER DASHBOARD / USER PANEL ROUTES
// ==========================================

// GET /api/member/dashboard
router.get('/member/dashboard', authenticate, async (req, res) => {
  try {
    const user = await getQuery(
      'SELECT id, name, email, role, status, committee_role, department, bio, skills, profile_photo, contact_links, project_contributions FROM users WHERE id = ?',
      [req.user.id]
    );

    const announcements = await allQuery('SELECT * FROM announcements ORDER BY id DESC LIMIT 5');
    const projects = await allQuery('SELECT * FROM projects WHERE status = "Active" OR status = "Active Development" LIMIT 4');

    let skills = [];
    let contact_links = {};
    let project_contributions = [];
    try { skills = user.skills ? JSON.parse(user.skills) : []; } catch (e) {}
    try { contact_links = user.contact_links ? JSON.parse(user.contact_links) : {}; } catch (e) {}
    try { project_contributions = user.project_contributions ? JSON.parse(user.project_contributions) : []; } catch (e) {}

    const myProposalsRaw = await allQuery('SELECT * FROM projects WHERE submitted_by_id = ? ORDER BY id DESC', [req.user.id]);
    const myProposals = myProposalsRaw.map(p => {
      let tech_stack = [];
      let team_members = [];
      try { tech_stack = p.tech_stack ? JSON.parse(p.tech_stack) : []; } catch (e) {}
      try { team_members = p.team_members ? JSON.parse(p.team_members) : []; } catch (e) {}
      return { ...p, tech_stack, team_members };
    });

    res.json({
      success: true,
      data: {
        profile: {
          ...user,
          skills,
          contact_links,
          project_contributions
        },
        announcements,
        activeProjects: projects,
        myProposals
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load member dashboard' });
  }
});

// POST /api/member/project-proposals: Member submits a new project proposal for admin approval
router.post('/member/project-proposals', authenticate, async (req, res) => {
  try {
    const { title, category, description, tech_stack, team_members, image_url, github_link } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Project title and description are required' });
    }

    const techStackJson = Array.isArray(tech_stack) ? JSON.stringify(tech_stack) : JSON.stringify([]);
    const teamMembersJson = Array.isArray(team_members) ? JSON.stringify(team_members) : JSON.stringify([]);
    const authorName = req.user.name || 'JSTU Member';

    const result = await runQuery(
      `INSERT INTO projects (title, category, description, status, image_url, github_link, tech_stack, team_members, approval_status, submitted_by_id, submitted_by_name)
       VALUES (?, ?, ?, 'Pending Approval', ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        title.trim(),
        category || 'Autonomous Terrestrial',
        description.trim(),
        image_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
        github_link || '',
        techStackJson,
        teamMembersJson,
        req.user.id,
        authorName
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Project proposal submitted successfully! Awaiting Super Admin review.',
      id: result.id
    });
  } catch (err) {
    console.error('Project proposal submission error:', err);
    res.status(500).json({ error: 'Failed to submit project proposal' });
  }
});

// GET /api/member/project-proposals: Fetch current member proposals
router.get('/member/project-proposals', authenticate, async (req, res) => {
  try {
    const rows = await allQuery('SELECT * FROM projects WHERE submitted_by_id = ? ORDER BY id DESC', [req.user.id]);
    const proposals = rows.map(p => {
      let tech_stack = [];
      let team_members = [];
      try { tech_stack = p.tech_stack ? JSON.parse(p.tech_stack) : []; } catch (e) {}
      try { team_members = p.team_members ? JSON.parse(p.team_members) : []; } catch (e) {}
      return { ...p, tech_stack, team_members };
    });
    res.json({ success: true, data: proposals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// PUT /api/member/profile: Member updates their own profile
router.put('/member/profile', authenticate, async (req, res) => {
  try {
    const { name, bio, skills, profile_photo, contact_links, department, student_id } = req.body;
    const userId = req.user.id;
    const cleanPhoto = (profile_photo && typeof profile_photo === 'string' && profile_photo.trim()) ? profile_photo.trim() : null;

    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([]);
    const contactLinksJson = typeof contact_links === 'object' ? JSON.stringify(contact_links) : JSON.stringify({});

    // 1. Update users table
    await runQuery(
      `UPDATE users
       SET name = COALESCE(?, name),
           bio = COALESCE(?, bio),
           skills = ?,
           profile_photo = COALESCE(?, profile_photo),
           contact_links = ?,
           department = COALESCE(?, department),
           student_id = COALESCE(?, student_id)
       WHERE id = ?`,
      [name, bio, skillsJson, cleanPhoto, contactLinksJson, department, student_id, userId]
    );

    const updatedUser = await getQuery(
      'SELECT id, name, email, role, status, committee_role, department, student_id, bio, skills, profile_photo, contact_links, project_contributions FROM users WHERE id = ?',
      [userId]
    );

    // 2. Synchronize to committee_members so changes appear live all across the site
    try {
      await runQuery(
        `UPDATE committee_members
         SET name = COALESCE(?, name),
             bio = COALESCE(?, bio),
             skills = ?,
             profile_photo = COALESCE(?, profile_photo),
             social_links = ?,
             department = COALESCE(?, department),
             student_id = COALESCE(?, student_id),
             user_id = ?
         WHERE user_id = ? OR (email IS NOT NULL AND email != '' AND LOWER(email) = LOWER(?))`,
        [name, bio, skillsJson, cleanPhoto, contactLinksJson, department, student_id, userId, userId, updatedUser?.email || '']
      );
    } catch (cmErr) {
      console.warn('Sync to committee_members warning:', cmErr.message);
    }

    let parsedSkills = [];
    let parsedLinks = {};
    try { parsedSkills = JSON.parse(updatedUser.skills); } catch (e) {}
    try { parsedLinks = JSON.parse(updatedUser.contact_links); } catch (e) {}

    res.json({
      success: true,
      message: 'Profile updated successfully! Your updates are now live all across the website.',
      data: {
        ...updatedUser,
        skills: parsedSkills,
        contact_links: parsedLinks
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==========================================
// 4. ADMIN CMS PANEL ROUTES (Require Admin)
// ==========================================

// PUT /api/admin/site-config: Master config for buttons, section titles, visibility toggles, and categories
router.put('/admin/site-config', authenticate, requireAdmin, async (req, res) => {
  try {
    const { config } = req.body;
    if (!config) {
      return res.status(400).json({ error: 'Config object required' });
    }
    const metaJson = JSON.stringify(config);
    const existing = await getQuery('SELECT key FROM site_content WHERE key = "site_config"');
    if (existing) {
      await runQuery(
        'UPDATE site_content SET content = "Master Site Configuration", meta_json = ?, updated_at = CURRENT_TIMESTAMP WHERE key = "site_config"',
        [metaJson]
      );
    } else {
      await runQuery(
        'INSERT INTO site_content (key, section, title, content, meta_json) VALUES ("site_config", "system", "Master Configuration", "Master Site Configuration", ?)',
        [metaJson]
      );
    }
    res.json({ success: true, message: 'Superpower site configuration saved successfully!' });
  } catch (err) {
    console.error('Config update error:', err);
    res.status(500).json({ error: 'Failed to update site configuration' });
  }
});

// PUT /api/admin/site-content: Dynamic Content Management Form Update
router.put('/admin/site-content', authenticate, requireAdmin, async (req, res) => {
  try {
    const { key, title, content, meta } = req.body;
    if (!key || content === undefined) {
      return res.status(400).json({ error: 'Key and content are required' });
    }

    const metaJson = meta ? JSON.stringify(meta) : null;

    const existing = await getQuery('SELECT key FROM site_content WHERE key = ?', [key]);
    if (existing) {
      await runQuery(
        `UPDATE site_content
         SET title = COALESCE(?, title),
             content = ?,
             meta_json = COALESCE(?, meta_json),
             updated_at = CURRENT_TIMESTAMP
         WHERE key = ?`,
        [title, content, metaJson, key]
      );
    } else {
      await runQuery(
        `INSERT INTO site_content (key, section, title, content, meta_json)
         VALUES (?, 'custom', ?, ?, ?)`,
        [key, title || '', content, metaJson]
      );
    }

    res.json({ success: true, message: `Content '${key}' updated successfully!` });
  } catch (err) {
    console.error('Error updating site content:', err);
    res.status(500).json({ error: 'Failed to update site content' });
  }
});

// GET /api/admin/users: All users data table with statuses and roles
router.get('/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const rows = await allQuery(`
      SELECT id, name, email, role, status, committee_role, department, student_id,
             bio, skills, profile_photo, contact_links, project_contributions, created_at
      FROM users
      ORDER BY id ASC
    `);

    const users = rows.map(u => {
      let skills = [];
      let contact_links = {};
      try { skills = u.skills ? JSON.parse(u.skills) : []; } catch (e) {}
      try { contact_links = u.contact_links ? JSON.parse(u.contact_links) : {}; } catch (e) {}
      return { ...u, skills, contact_links };
    });

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/admin/users/:id/role: Change role (Admin / Member)
router.put('/admin/users/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Member'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either Admin or Member' });
    }

    await runQuery('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ success: true, message: `User role updated to ${role}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// PUT /api/admin/users/:id/status: Approve or Reject user membership
router.put('/admin/users/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved, pending, or rejected' });
    }

    await runQuery('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// PUT /api/admin/users/:id: Edit any user's profile info
router.put('/admin/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, status, committee_role, department, student_id, bio, skills, profile_photo } = req.body;
    const cleanPhoto = (profile_photo && typeof profile_photo === 'string' && profile_photo.trim()) ? profile_photo.trim() : null;
    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : null;

    await runQuery(
      `UPDATE users
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           role = COALESCE(?, role),
           status = COALESCE(?, status),
           committee_role = COALESCE(?, committee_role),
           department = COALESCE(?, department),
           student_id = COALESCE(?, student_id),
           bio = COALESCE(?, bio),
           skills = COALESCE(?, skills),
           profile_photo = COALESCE(?, profile_photo)
       WHERE id = ?`,
      [name, email, role, status, committee_role, department, student_id, bio, skillsJson, cleanPhoto, req.params.id]
    );

    // Also sync to committee_members if linked
    try {
      const targetUser = await getQuery('SELECT email FROM users WHERE id = ?', [req.params.id]);
      await runQuery(
        `UPDATE committee_members
         SET name = COALESCE(?, name),
             email = COALESCE(?, email),
             department = COALESCE(?, department),
             student_id = COALESCE(?, student_id),
             bio = COALESCE(?, bio),
             skills = COALESCE(?, skills),
             profile_photo = COALESCE(?, profile_photo),
             user_id = ?
         WHERE user_id = ? OR (email IS NOT NULL AND email != '' AND LOWER(email) = LOWER(?))`,
        [name, email, department, student_id, bio, skillsJson, cleanPhoto, req.params.id, req.params.id, targetUser?.email || '']
      );
    } catch (cmErr) {}

    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id: Delete user
router.delete('/admin/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (parseInt(req.params.id, 10) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own active admin account' });
    }
    await runQuery('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Projects Management CRUD (Admin)
router.post('/admin/projects', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, category, description, status, image_url, github_link, tech_stack, team_members } = req.body;
    const techStackJson = Array.isArray(tech_stack) ? JSON.stringify(tech_stack) : JSON.stringify([]);
    const teamMembersJson = Array.isArray(team_members) ? JSON.stringify(team_members) : JSON.stringify([]);

    const result = await runQuery(
      `INSERT INTO projects (title, category, description, status, image_url, github_link, tech_stack, team_members)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category || 'Robotics', description, status || 'Active', image_url, github_link, techStackJson, teamMembersJson]
    );

    res.status(201).json({ success: true, message: 'Project created successfully', id: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/admin/projects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, category, description, status, image_url, github_link, tech_stack, team_members } = req.body;
    const techStackJson = Array.isArray(tech_stack) ? JSON.stringify(tech_stack) : null;
    const teamMembersJson = Array.isArray(team_members) ? JSON.stringify(team_members) : null;

    await runQuery(
      `UPDATE projects
       SET title = COALESCE(?, title),
           category = COALESCE(?, category),
           description = COALESCE(?, description),
           status = COALESCE(?, status),
           image_url = COALESCE(?, image_url),
           github_link = COALESCE(?, github_link),
           tech_stack = COALESCE(?, tech_stack),
           team_members = COALESCE(?, team_members)
       WHERE id = ?`,
      [title, category, description, status, image_url, github_link, techStackJson, teamMembersJson, req.params.id]
    );

    res.json({ success: true, message: 'Project updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/admin/projects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await runQuery('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// GET /api/admin/project-proposals: Admin views all pending project proposals
router.get('/admin/project-proposals', authenticate, requireAdmin, async (req, res) => {
  try {
    const rows = await allQuery(
      "SELECT * FROM projects WHERE approval_status = 'pending' ORDER BY id DESC"
    );
    const proposals = rows.map(p => {
      let tech_stack = [];
      let team_members = [];
      try { tech_stack = p.tech_stack ? JSON.parse(p.tech_stack) : []; } catch (e) {}
      try { team_members = p.team_members ? JSON.parse(p.team_members) : []; } catch (e) {}
      return { ...p, tech_stack, team_members };
    });
    res.json({ success: true, count: proposals.length, data: proposals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project proposals' });
  }
});

// PUT /api/admin/project-proposals/:id/decision: Super Admin approves or rejects a proposal
router.put('/admin/project-proposals/:id/decision', authenticate, requireAdmin, async (req, res) => {
  try {
    const { decision } = req.body;
    if (!decision || (decision !== 'approved' && decision !== 'rejected')) {
      return res.status(400).json({ error: "Decision must be 'approved' or 'rejected'" });
    }

    if (decision === 'approved') {
      await runQuery(
        "UPDATE projects SET approval_status = 'approved', status = 'Active' WHERE id = ?",
        [req.params.id]
      );
      res.json({ success: true, message: 'Project proposal approved and published to public showcase!' });
    } else {
      await runQuery(
        "UPDATE projects SET approval_status = 'rejected', status = 'Proposal Rejected' WHERE id = ?",
        [req.params.id]
      );
      res.json({ success: true, message: 'Project proposal marked as rejected.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to process proposal decision' });
  }
});

// Agenda Items CRUD (Admin)
router.post('/admin/agenda', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, badge, order_num } = req.body;
    const result = await runQuery(
      'INSERT INTO agenda_items (title, description, date, badge, order_num) VALUES (?, ?, ?, ?, ?)',
      [title, description, date, badge, order_num || 0]
    );
    res.status(201).json({ success: true, message: 'Agenda item created', id: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create agenda item' });
  }
});

router.put('/admin/agenda/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, badge, order_num } = req.body;
    await runQuery(
      `UPDATE agenda_items
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           date = COALESCE(?, date),
           badge = COALESCE(?, badge),
           order_num = COALESCE(?, order_num)
       WHERE id = ?`,
      [title, description, date, badge, order_num, req.params.id]
    );
    res.json({ success: true, message: 'Agenda item updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update agenda item' });
  }
});

router.delete('/admin/agenda/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await runQuery('DELETE FROM agenda_items WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Agenda item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete agenda item' });
  }
});

// Directory Roles CRUD (Admin)
router.post('/admin/roles', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, priority, category } = req.body;
    const result = await runQuery(
      'INSERT INTO directory_roles (name, priority, category) VALUES (?, ?, ?)',
      [name, priority || 0, category || 'Executive']
    );
    res.status(201).json({ success: true, message: 'Role added', id: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add role' });
  }
});

router.delete('/admin/roles/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await runQuery('DELETE FROM directory_roles WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// Announcements CRUD (Admin)
router.post('/admin/announcements', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, content, priority } = req.body;
    const authorName = req.user.name || 'JSTU Committee';
    const result = await runQuery(
      'INSERT INTO announcements (title, content, priority, author_name) VALUES (?, ?, ?, ?)',
      [title, content, priority || 'normal', authorName]
    );
    res.status(201).json({ success: true, message: 'Announcement posted', id: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post announcement' });
  }
});

router.delete('/admin/announcements/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await runQuery('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Announcement removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove announcement' });
  }
});

// ==========================================
// 8. ADMIN COMMITTEES & EXCOM MANAGEMENT
// ==========================================

// POST /api/admin/committees: Create new committee tenure
router.post('/admin/committees', authenticate, requireAdmin, async (req, res) => {
  try {
    const { committee_number, title, session_years, is_current, theme_motto, description, banner_url } = req.body;
    if (!committee_number || !title || !session_years) {
      return res.status(400).json({ error: 'Committee number, title, and session years are required' });
    }

    const existing = await getQuery('SELECT id FROM committees WHERE committee_number = ?', [committee_number]);
    if (existing) {
      return res.status(400).json({ error: `Committee #${committee_number} already exists` });
    }

    if (is_current) {
      await runQuery('UPDATE committees SET is_current = 0');
    }

    const result = await runQuery(
      `INSERT INTO committees (committee_number, title, session_years, is_current, theme_motto, description, banner_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [committee_number, title, session_years, is_current ? 1 : 0, theme_motto || '', description || '', banner_url || '']
    );

    res.status(201).json({ success: true, message: 'Committee tenure created successfully', id: result.id });
  } catch (err) {
    console.error('Create committee error:', err);
    res.status(500).json({ error: 'Failed to create committee' });
  }
});

// PUT /api/admin/committees/:id: Update committee info
router.put('/admin/committees/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { committee_number, title, session_years, is_current, theme_motto, description, banner_url } = req.body;
    
    if (is_current) {
      await runQuery('UPDATE committees SET is_current = 0');
    }

    await runQuery(
      `UPDATE committees
       SET committee_number = COALESCE(?, committee_number),
           title = COALESCE(?, title),
           session_years = COALESCE(?, session_years),
           is_current = COALESCE(?, is_current),
           theme_motto = COALESCE(?, theme_motto),
           description = COALESCE(?, description),
           banner_url = COALESCE(?, banner_url)
       WHERE id = ?`,
      [committee_number, title, session_years, is_current !== undefined ? (is_current ? 1 : 0) : undefined, theme_motto, description, banner_url, req.params.id]
    );

    res.json({ success: true, message: 'Committee updated successfully' });
  } catch (err) {
    console.error('Update committee error:', err);
    res.status(500).json({ error: 'Failed to update committee' });
  }
});

// PUT /api/admin/committees/:id/set-current: Switch running committee
router.put('/admin/committees/:id/set-current', authenticate, requireAdmin, async (req, res) => {
  try {
    await runQuery('UPDATE committees SET is_current = 0');
    await runQuery('UPDATE committees SET is_current = 1 WHERE id = ?', [req.params.id]);
    const current = await getQuery('SELECT * FROM committees WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: `Committee #${current.committee_number} (${current.title}) is now the active running committee!`, committee: current });
  } catch (err) {
    console.error('Set current committee error:', err);
    res.status(500).json({ error: 'Failed to set running committee' });
  }
});

// DELETE /api/admin/committees/:id
router.delete('/admin/committees/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await runQuery('DELETE FROM committee_members WHERE committee_id = ?', [req.params.id]);
    await runQuery('DELETE FROM committees WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Committee and member assignments deleted' });
  } catch (err) {
    console.error('Delete committee error:', err);
    res.status(500).json({ error: 'Failed to delete committee' });
  }
});

// POST /api/admin/committees/:id/members: Add member to one or multiple committee sessions
router.post('/admin/committees/:id/members', authenticate, requireAdmin, async (req, res) => {
  try {
    const { user_id, name, email, department, student_id, designation, category, is_override, profile_photo, bio, skills, display_order, target_committee_ids } = req.body;
    
    let memberName = name;
    let memberEmail = email;
    let memberDept = department;
    let memberStudentId = student_id;
    let memberPhoto = profile_photo;
    let memberBio = bio;
    let memberSkills = skills;

    if (user_id) {
      const user = await getQuery('SELECT * FROM users WHERE id = ?', [user_id]);
      if (user) {
        memberName = memberName || user.name;
        memberEmail = memberEmail || user.email;
        memberDept = memberDept || user.department;
        memberStudentId = memberStudentId || user.student_id;
        memberPhoto = memberPhoto || user.profile_photo;
        memberBio = memberBio || user.bio;
        memberSkills = memberSkills || user.skills;
      }
    }

    if (!memberName || !designation) {
      return res.status(400).json({ error: 'Member name and designation are required' });
    }

    let finalCategory = category;
    let manualOverride = is_override ? 1 : 0;
    if (!finalCategory || finalCategory === 'Auto') {
      finalCategory = inferMemberCategory(designation);
      manualOverride = 0;
    } else {
      manualOverride = 1;
    }

    const skillsJson = typeof memberSkills === 'string' ? memberSkills : JSON.stringify(memberSkills || []);

    // Target committees can be multiple or single (fallback to req.params.id)
    const targetIds = (Array.isArray(target_committee_ids) && target_committee_ids.length > 0)
      ? target_committee_ids
      : [parseInt(req.params.id, 10)];

    const createdIds = [];
    for (const cId of targetIds) {
      const result = await runQuery(
        `INSERT INTO committee_members (committee_id, user_id, name, email, department, student_id, designation, category, is_override, profile_photo, bio, skills, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cId, user_id || null, memberName, memberEmail || '', memberDept || 'Computer Science & Engineering',
          memberStudentId || '', designation, finalCategory, manualOverride,
          (memberPhoto && memberPhoto.trim()) ? memberPhoto.trim() : '', memberBio || '', skillsJson, display_order || 10
        ]
      );
      createdIds.push(result.id);
    }

    res.status(201).json({
      success: true,
      message: `Member successfully added to ${createdIds.length} committee session(s)`,
      ids: createdIds,
      category: finalCategory
    });
  } catch (err) {
    console.error('Add committee member error:', err);
    res.status(500).json({ error: 'Failed to add member to committee' });
  }
});

// PUT /api/admin/committees/members/:memberId: Edit committee member (including changing committee session)
router.put('/admin/committees/members/:memberId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { committee_id, name, email, department, student_id, designation, category, is_override, profile_photo, bio, skills, display_order } = req.body;

    let finalCategory = category;
    let manualOverride = is_override;

    if (category === 'Auto') {
      finalCategory = inferMemberCategory(designation);
      manualOverride = 0;
    } else if (category && ['Executive', 'Lead', 'Advisor', 'Member'].includes(category)) {
      manualOverride = 1;
    }

    const skillsJson = skills !== undefined ? (typeof skills === 'string' ? skills : JSON.stringify(skills)) : undefined;

    await runQuery(
      `UPDATE committee_members
       SET committee_id = COALESCE(?, committee_id),
           name = COALESCE(?, name),
           email = COALESCE(?, email),
           department = COALESCE(?, department),
           student_id = COALESCE(?, student_id),
           designation = COALESCE(?, designation),
           category = COALESCE(?, category),
           is_override = COALESCE(?, is_override),
           profile_photo = COALESCE(?, profile_photo),
           bio = COALESCE(?, bio),
           skills = COALESCE(?, skills),
           display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [committee_id || null, name, email, department, student_id, designation, finalCategory, manualOverride, (profile_photo && profile_photo.trim()) ? profile_photo.trim() : null, bio, skillsJson, display_order, req.params.memberId]
    );

    // Also synchronize profile changes to users table if this member has a linked user account
    try {
      const cm = await getQuery('SELECT user_id, email FROM committee_members WHERE id = ?', [req.params.memberId]);
      if (cm) {
        await runQuery(
          `UPDATE users
           SET profile_photo = COALESCE(?, profile_photo),
               name = COALESCE(?, name),
               bio = COALESCE(?, bio),
               skills = COALESCE(?, skills),
               department = COALESCE(?, department),
               student_id = COALESCE(?, student_id)
           WHERE (id IS NOT NULL AND id = ?) OR (email IS NOT NULL AND email != '' AND LOWER(email) = LOWER(?))`,
          [(profile_photo && profile_photo.trim()) ? profile_photo.trim() : null, name, bio, skillsJson, department, student_id, cm.user_id, cm.email]
        );
      }
    } catch (uErr) {
      console.warn('Sync committee member to users warning:', uErr.message);
    }

    const updated = await getQuery('SELECT * FROM committee_members WHERE id = ?', [req.params.memberId]);
    res.json({ success: true, message: 'Committee member updated', category: finalCategory, data: updated });
  } catch (err) {
    console.error('Update committee member error:', err);
    res.status(500).json({ error: 'Failed to update committee member' });
  }
});

// GET /api/admin/users/:id/committees: Get all committee sessions assigned to a registered user
router.get('/admin/users/:id/committees', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const assignments = await allQuery(
      `SELECT cm.id as cm_id, cm.committee_id, c.committee_number, c.title as committee_title,
              c.session_years, c.is_current, cm.designation, cm.category
       FROM committee_members cm
       JOIN committees c ON cm.committee_id = c.id
       WHERE cm.user_id = ? OR (cm.email IS NOT NULL AND cm.email != '' AND LOWER(cm.email) = LOWER(?))
       ORDER BY c.committee_number DESC`,
      [user.id, user.email]
    );

    res.json({ success: true, data: assignments });
  } catch (err) {
    console.error('Get user committee assignments error:', err);
    res.status(500).json({ error: 'Failed to get committee assignments' });
  }
});

// POST /api/admin/users/:id/assign-committees: Assign or update multiple committee sessions for a registered user
router.post('/admin/users/:id/assign-committees', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { committee_assignments } = req.body;
    // committee_assignments should be array of: { committee_id: number, designation?: string, category?: string }
    if (!Array.isArray(committee_assignments)) {
      return res.status(400).json({ error: 'committee_assignments must be an array' });
    }

    // 1. Remove existing committee memberships for this user
    await runQuery(
      `DELETE FROM committee_members WHERE user_id = ? OR (email IS NOT NULL AND email != '' AND LOWER(email) = LOWER(?))`,
      [user.id, user.email]
    );

    // 2. Insert for each chosen committee
    for (const a of committee_assignments) {
      const des = a.designation || user.committee_role || 'Executive Member';
      const cat = a.category || inferMemberCategory(des);
      await runQuery(
        `INSERT INTO committee_members (committee_id, user_id, name, email, department, student_id, designation, category, is_override, profile_photo, bio, skills, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 10)`,
        [
          a.committee_id, user.id, user.name, user.email, user.department, user.student_id,
          des, cat, user.profile_photo || '', user.bio || '', user.skills || '[]'
        ]
      );
    }

    res.json({ success: true, message: `Updated session assignments for ${user.name} across ${committee_assignments.length} committee(s)` });
  } catch (err) {
    console.error('Assign user committees error:', err);
    res.status(500).json({ error: 'Failed to assign committee sessions' });
  }
});

// DELETE /api/admin/committees/members/:memberId
router.delete('/admin/committees/members/:memberId', authenticate, requireAdmin, async (req, res) => {
  try {
    await runQuery('DELETE FROM committee_members WHERE id = ?', [req.params.memberId]);
    res.json({ success: true, message: 'Member removed from committee' });
  } catch (err) {
    console.error('Remove committee member error:', err);
    res.status(500).json({ error: 'Failed to remove committee member' });
  }
});

// POST /api/admin/committees/:id/copy-from/:fromId: Clone members from previous committee
router.post('/admin/committees/:id/copy-from/:fromId', authenticate, requireAdmin, async (req, res) => {
  try {
    const fromMembers = await allQuery('SELECT * FROM committee_members WHERE committee_id = ?', [req.params.fromId]);
    for (const m of fromMembers) {
      await runQuery(
        `INSERT INTO committee_members (committee_id, user_id, name, email, department, student_id, designation, category, is_override, profile_photo, bio, skills, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.params.id, m.user_id, m.name, m.email, m.department, m.student_id,
          m.designation, m.category, m.is_override, m.profile_photo, m.bio, m.skills, m.display_order
        ]
      );
    }
    res.json({ success: true, message: `Copied ${fromMembers.length} members from committee into current tenure` });
  } catch (err) {
    console.error('Copy committee members error:', err);
    res.status(500).json({ error: 'Failed to copy members' });
  }
});

// PUT /admin/users/:id/committee-category: Override user's committee category
router.put(['/admin/users/:id/committee-category', '/api/admin/users/:id/committee-category'], authenticate, requireAdmin, async (req, res) => {
  try {
    const { committee_category, committee_role } = req.body;
    await runQuery(
      `UPDATE users
       SET committee_category = COALESCE(?, committee_category),
           committee_role = COALESCE(?, committee_role)
       WHERE id = ?`,
      [committee_category, committee_role, req.params.id]
    );
    res.json({ success: true, message: 'User committee category updated' });
  } catch (err) {
    console.error('Update user category error:', err);
    res.status(500).json({ error: 'Failed to update user category' });
  }
});

module.exports = router;
