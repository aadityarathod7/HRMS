const express = require('express');
const router = express.Router();
const leaveService = require('../services/leaveRequestService');
const { authenticate, authorize } = require('../middleware/auth');

// These routes exist for frontend compatibility (frontend calls /Leaves/*)
// They delegate to the same service as /leaverequests/*

router.post('/create', authenticate, async (req, res, next) => {
  try { res.status(201).json(await leaveService.createLeaveRequest(req.body)); }
  catch (error) { next(error); }
});

router.get('/inactive', authenticate, async (req, res, next) => {
  try { res.json(await leaveService.getRejectedLeaves()); }
  catch (error) { next(error); }
});

router.patch('/activate/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try {
    // Revert to PENDING
    const LeaveRequest = require('../models/LeaveRequest');
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    leave.leaveStatus = 'PENDING'; leave.updatedDate = new Date(); await leave.save();
    res.json({ message: 'Leave request reactivated' });
  } catch (error) { next(error); }
});

router.patch('/deactivate/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try { res.json(await leaveService.rejectLeaveRequest(req.params.id, req.user.id, 'Deactivated by admin')); }
  catch (error) { next(error); }
});

router.put('/deactivate/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try { res.json(await leaveService.rejectLeaveRequest(req.params.id, req.user.id, 'Deactivated by admin')); }
  catch (error) { next(error); }
});

router.patch('/approve/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try { res.json(await leaveService.approveLeaveRequest(req.params.id, req.user.id)); }
  catch (error) { next(error); }
});

router.patch('/reject/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try { res.json(await leaveService.rejectLeaveRequest(req.params.id, req.user.id, req.body.rejectionReason || 'Rejected')); }
  catch (error) { next(error); }
});

module.exports = router;
