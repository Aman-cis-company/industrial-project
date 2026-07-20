const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect } = require('../middleware/auth');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_pmo_erp_platform_token', {
    expiresIn: '30d'
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        token: generateToken(user.id),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          phone: user.phone,
          avatarUrl: user.avatarUrl
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { name, email, avatarUrl, phone, password } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If email is changing, make sure it's not taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email address already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    
    if (password) {
      user.password = password; // Will be hashed via hook
    }

    await user.save();

    // If phone is provided, find the Employee model and update it
    const { Employee } = require('../models');
    const employee = await Employee.findOne({ where: { userId: user.id } });
    if (employee) {
      if (phone) employee.phone = phone;
      await employee.save();
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
