const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { blacklistToken } = require('../middleware/auth');

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { userName, password } = req.body;

    const user = await User.findOne({ userName }).populate('roles').populate('department', 'departmentName');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const roles = user.roles.map(r => r.role);

    const token = jwt.sign(
      { id: user._id, username: user.userName, roles },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      roles,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        department: user.department,
        designation: user.designation,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    blacklistToken(token);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In production, send this token via email
    // For now, return it in the response
    res.json({ message: 'Password reset link has been sent to your email', resetToken });
  } catch (error) {
    next(error);
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.updatedDate = new Date();
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    next(error);
  }
});

module.exports = router;
