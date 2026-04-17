const express = require('express');
const router = express.Router();
const managerService = require('../services/managerService');
const { authenticate, authorize } = require('../middleware/auth');

router.put('/leaveRequest/:leaveRequestId/updateStatus', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try {
    const { status } = req.query;
    res.json({ message: await managerService.updateLeaveStatus(req.params.leaveRequestId, status) });
  } catch (error) { next(error); }
});

module.exports = router;
