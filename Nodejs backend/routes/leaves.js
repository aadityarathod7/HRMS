const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const { broadcast } = require('../config/socket');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/create', authenticate, async (req, res, next) => {
  try {
    const leave = new LeaveRequest({ ...req.body, leaveStatus: 'PENDING', createdDate: new Date() });
    const saved = await leave.save();
    try { broadcast({ type: 'NEW_REQUEST', message: 'New leave request created', data: saved }); } catch (e) {}
    res.status(201).json(saved);
  } catch (error) { next(error); }
});

router.get('/inactive', authenticate, async (req, res, next) => {
  try { res.json(await LeaveRequest.find({ leaveStatus: 'REJECTED' })); }
  catch (error) { next(error); }
});

router.patch('/activate/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    leave.leaveStatus = 'PENDING'; leave.updatedDate = new Date(); await leave.save();
    res.json({ message: 'Leave request activated' });
  } catch (error) { next(error); }
});

router.patch('/deactivate/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    leave.leaveStatus = 'REJECTED'; leave.updatedDate = new Date(); await leave.save();
    res.json({ message: 'Leave request deactivated' });
  } catch (error) { next(error); }
});

router.put('/deactivate/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    leave.leaveStatus = 'REJECTED'; leave.updatedDate = new Date(); await leave.save();
    res.json({ message: 'Leave request deactivated' });
  } catch (error) { next(error); }
});

router.patch('/approve/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    leave.leaveStatus = 'APPROVED'; leave.updatedDate = new Date(); await leave.save();
    try { broadcast({ type: 'LEAVE_APPROVED', message: `Leave request ${req.params.id} approved`, data: leave }); } catch (e) {}
    res.json({ message: 'Leave request approved' });
  } catch (error) { next(error); }
});

router.patch('/reject/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    leave.leaveStatus = 'REJECTED'; leave.updatedDate = new Date(); await leave.save();
    try { broadcast({ type: 'LEAVE_REJECTED', message: `Leave request ${req.params.id} rejected`, data: leave }); } catch (e) {}
    res.json({ message: 'Leave request rejected' });
  } catch (error) { next(error); }
});

module.exports = router;
