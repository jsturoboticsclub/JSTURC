const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jstu_robotics_club_jwt_secret_2026_super_secure';

const authenticateToken = (req, res, next) => {
  // Allow OPTIONS requests to pass through without authentication (for CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Reduced logging for production
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 AUTH:', req.method, req.url);
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Handle regular JWT tokens
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    console.log('❌ Token validation failed:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken; 