const express = require('express');
const router = express.Router();
const leaveService = require('../services/leaveRequestService');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/submit', authenticate, async (req, res, next) => {
  try { res.status(201).json(await leaveService.createLeaveRequest(req.body)); }
  catch (error) { next(error); }
});

router.put('/update/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.json(await leaveService.updateLeaveRequest(req.params.id, req.body)); }
  catch (error) { next(error); }
});

router.put('/approve/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try { res.json(await leaveService.approveLeaveRequest(req.params.id, req.user.id)); }
  catch (error) { next(error); }
});

router.put('/reject/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try { res.json(await leaveService.rejectLeaveRequest(req.params.id, req.user.id, req.body.rejectionReason)); }
  catch (error) { next(error); }
});

router.put('/cancel/:id', authenticate, async (req, res, next) => {
  try { res.json(await leaveService.cancelLeaveRequest(req.params.id)); }
  catch (error) { next(error); }
});

router.delete('/delete/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { await leaveService.deleteLeaveRequest(req.params.id); res.status(204).send(); }
  catch (error) { next(error); }
});

router.get('/balance/:userId', authenticate, async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    res.json(await leaveService.getLeaveBalance(req.params.userId, year));
  } catch (error) { next(error); }
});

// PUT /leaverequests/balance/update — Assign/update leave balance (HR/Admin only)
router.put('/balance/update', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const { userId, leaveType, totalAllotted, year } = req.body;
    if (!userId || !leaveType || totalAllotted === undefined) {
      return res.status(400).json({ message: 'userId, leaveType, and totalAllotted are required' });
    }
    const LeaveBalance = require('../models/LeaveBalance');
    const balanceYear = year || new Date().getFullYear();
    let balance = await LeaveBalance.findOne({ userId, leaveType, year: balanceYear });
    if (balance) {
      balance.totalAllotted = totalAllotted;
      balance.available = totalAllotted - balance.used;
      await balance.save();
    } else {
      balance = await LeaveBalance.create({ userId, leaveType, totalAllotted, used: 0, available: totalAllotted, year: balanceYear });
    }
    res.json(balance);
  } catch (error) { next(error); }
});

// GET /leaverequests/balance/all — Get all employees' leave balances (HR/Admin)
router.get('/balance/all/:year?', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const LeaveBalance = require('../models/LeaveBalance');
    const year = req.params.year || new Date().getFullYear();
    const balances = await LeaveBalance.find({ year })
      .populate('userId', 'firstname lastname employeeId department')
      .sort({ userId: 1, leaveType: 1 });
    res.json(balances);
  } catch (error) { next(error); }
});

router.get('/user/:userId', authenticate, async (req, res, next) => {
  try { res.json(await leaveService.getLeavesByUser(req.params.userId)); }
  catch (error) { next(error); }
});

router.get('/approved', authenticate, async (req, res, next) => {
  try { res.json(await leaveService.getApprovedLeaves()); }
  catch (error) { next(error); }
});

router.get('/pending', authenticate, async (req, res, next) => {
  try { res.json(await leaveService.getPendingLeaves()); }
  catch (error) { next(error); }
});

router.get('/rejected', authenticate, async (req, res, next) => {
  try { res.json(await leaveService.getRejectedLeaves()); }
  catch (error) { next(error); }
});

router.get('/status/:status', authenticate, async (req, res, next) => {
  try { res.json(await leaveService.getLeavesByStatus(req.params.status)); }
  catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try { res.json(await leaveService.getLeaveRequestById(req.params.id)); }
  catch (error) { next(error); }
});

router.get('/', authenticate, async (req, res, next) => {
  try { res.json(await leaveService.getAllLeaveRequests()); }
  catch (error) { next(error); }
});

module.exports = router;
