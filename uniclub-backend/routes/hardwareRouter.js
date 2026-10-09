const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { runQuery, getQuery, allQuery } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'jstu_robotics_club_jwt_secret_2026_super_secure';

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Access token required' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Administrator privileges required' });
  }
  next();
};

// POST /api/hardware/loans - Member requests hardware loan
router.post('/loans', authenticate, async (req, res) => {
  try {
    const { hardware_id, hardware_title, requested_days = 7, project_name = '', purpose = '' } = req.body;
    if (!hardware_id || !hardware_title) {
      return res.status(400).json({ success: false, error: 'Hardware ID and title are required' });
    }

    const user = await getQuery('SELECT id, name, email, status FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const duration = Math.min(Math.max(parseInt(requested_days, 10) || 7, 1), 30);
    const result = await runQuery(
      `INSERT INTO hardware_loans (user_id, user_name, user_email, hardware_id, hardware_title, requested_days, project_name, purpose, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [user.id, user.name, user.email, hardware_id, hardware_title, duration, project_name, purpose]
    );

    res.json({
      success: true,
      message: 'Hardware loan requisition submitted for approval',
      loan_id: result.lastID
    });
  } catch (err) {
    console.error('Create hardware loan error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to submit hardware loan requisition' });
  }
});

// GET /api/hardware/loans/mine - Member views their own loan history
router.get('/loans/mine', authenticate, async (req, res) => {
  try {
    const loans = await allQuery(
      `SELECT * FROM hardware_loans WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, loans });
  } catch (err) {
    console.error('Fetch my loans error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve loan records' });
  }
});

module.exports = router;
