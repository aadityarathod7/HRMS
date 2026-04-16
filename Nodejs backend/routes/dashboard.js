const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');
const { authenticate } = require('../middleware/auth');

router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const roles = req.user.roles;
    const isAdminOrHR = roles.some(r => ['ADMIN', 'HR'].includes(r));
    const isManager = roles.includes('MANAGER');

    if (isAdminOrHR) {
      const stats = await dashboardService.getAdminStats();
      return res.json({ role: 'ADMIN', ...stats });
    }

    if (isManager) {
      const stats = await dashboardService.getManagerStats(req.user.id);
      return res.json({ role: 'MANAGER', ...stats });
    }

    // Employee
    const stats = await dashboardService.getEmployeeStats(req.user.id);
    return res.json({ role: 'EMPLOYEE', ...stats });
  } catch (error) { next(error); }
});

module.exports = router;
