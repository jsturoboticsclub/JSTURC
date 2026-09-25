const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const multer = require('multer');

// Rate limiting for avatar uploads
const uploadLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

// Use memory storage for Base64 conversion
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Minimal user router for backend startup
router.get('/ping', (req, res) => {
  res.json({ status: 'ok', message: 'User router is working.' });
});

// GET /api/users - list users with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await User.find({}, 'name profile.avatar')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/avatar/:userId - Serve avatar as Base64 or binary
router.get('/avatar/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('profile.avatar');
    
    if (!user || !user.profile?.avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    // Extract base64 data (remove data:image/jpeg;base64, prefix)
    const base64Data = user.profile.avatar.data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    res.set('Content-Type', user.profile.avatar.contentType);
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(buffer);
    
  } catch (error) {
    console.error('Avatar serve error:', error);
    res.status(500).json({ error: 'Failed to retrieve avatar' });
  }
});

// GET /api/users/avatar-url/:userId - get avatar URL for a user
router.get('/avatar-url/:userId', (req, res) => {
  res.status(404).json({ error: 'Avatar endpoints removed - rebuilding from scratch' });
});

// POST /api/users/avatar - Upload avatar as Base64
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert buffer to Base64
    const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    let user;
    
    // Handle debug user - find or create User record
    if (req.user.debug) {
      console.log('🔧 Debug user avatar upload - finding/creating user record');
      
      // Find user by email
      user = await User.findOne({ email: req.user.email });
      
      if (!user) {
        console.log('🔧 Creating new User record for debug user');
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash('debug-password-2024', 12);
        
        user = new User({
          email: req.user.email,
          name: 'Ashwin Thomas',
          uniqueId: 'UTDAIC1',
          passwordHash: passwordHash,
          isEnrolled: true,
          profile: {
            bio: 'Debug user for testing',
            location: 'Richardson, TX',
            interests: ['AI', 'Computer Engineering']
          },
          isVerified: true
        });
        await user.save();
        console.log('✅ Created new User record with ID:', user._id);
      }
      
      console.log(`📤 Avatar upload request from debug user: ${user._id}`);
    } else {
      // Regular user lookup
      user = await User.findById(req.user.userId);
      console.log(`📤 Avatar upload request from user: ${req.user.userId}`);
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user document with Base64 data
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        'profile.avatar': {
          data: base64Data,
          contentType: req.file.mimetype,
          originalName: req.file.originalname,
          size: req.file.size,
          uploadedAt: new Date()
        }
      },
      { new: true }
    );

    console.log('✅ Avatar updated in database as Base64');

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: updatedUser.profile.avatar
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// DELETE /api/users/avatar - Remove avatar from database
router.delete('/avatar', authenticateToken, async (req, res) => {
  try {
    // Handle debug user - now deletes from database like regular users
    if (req.user.debug) {
      console.log('🔧 Debug user avatar delete - removing from database (persistent)');
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $unset: { 'profile.avatar': "" } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('🗑️ Avatar removed from database');

    res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });

  } catch (error) {
    console.error('Avatar delete error:', error);
    res.status(500).json({ error: 'Failed to delete avatar' });
  }
});

// GET /api/users/me - Clean version without broken avatar logic
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let user;
    
    // Handle debug user - find by email
    if (req.user.debug) {
      console.log('🔧 Debug user profile request - fetching from database');
      user = await User.findOne({ email: req.user.email });
      
      if (!user) {
        // Return minimal data if user doesn't exist yet
        return res.json({
          success: true,
          user: {
            id: null,
            email: req.user.email,
            name: 'Ashwin Thomas',
            uniqueId: 'UTDAIC1',
            avatar: null,
            profile: {
              bio: 'Debug user for testing',
              location: 'Richardson, TX',
              interests: ['AI', 'Computer Engineering']
            },
            socialStats: { posts: 0, likes: 0, comments: 0 },
            settings: {},
            lastActive: new Date()
          }
        });
      }
    } else {
      // Regular user lookup
      user = await User.findById(req.user.userId);
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        uniqueId: user.uniqueId,
        avatar: user.profile?.avatar || null, // Direct Base64 data or null
        profile: user.profile,
        socialStats: user.socialStats,
        settings: user.settings,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { bio, location, website, interests } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        'profile.bio': bio || '',
        'profile.location': location || '',
        'profile.website': website || '',
        'profile.interests': interests || []
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        uniqueId: updatedUser.uniqueId,
        profile: updatedUser.profile,
        socialStats: updatedUser.socialStats,
        settings: updatedUser.settings,
        lastActive: updatedUser.lastActive
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DELETE /api/users/cleanup-avatars - Remove all broken avatar data (ADMIN ONLY)
router.delete('/cleanup-avatars', authenticateToken, async (req, res) => {
  try {
    console.log('🧹 Starting complete avatar cleanup...');
    
    // Remove all avatar fields from all users
    const result = await User.updateMany(
      {},
      { $unset: { 'profile.avatar': "" } }
    );
    
    console.log(`✅ Cleaned avatar data from ${result.modifiedCount} users`);
    
    res.json({
      success: true,
      message: `Cleaned avatar data from ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup avatar data' });
  }
});

module.exports = router; 