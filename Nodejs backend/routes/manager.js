const express = require('express');
const router = express.Router();
const managerService = require('../services/managerService');

// PUT /manager/leaveRequest/:leaveRequestId/updateStatus
router.put('/leaveRequest/:leaveRequestId/updateStatus', async (req, res, next) => {
  try {
    const { status } = req.query;
    const result = await managerService.updateLeaveStatus(req.params.leaveRequestId, status);
    res.json({ message: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
