const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const { broadcast } = require('../config/socket');

// POST /Leaves/create
router.post('/create', async (req, res, next) => {
  try {
    const leave = new LeaveRequest({
      ...req.body,
      leaveStatus: 'PENDING',
      createdDate: new Date()
    });
    const saved = await leave.save();

    try {
      broadcast({
        type: 'NEW_REQUEST',
        message: `New leave request created`,
        data: saved
      });
    } catch (e) {}

    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

// GET /Leaves/inactive
router.get('/inactive', async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ leaveStatus: 'REJECTED' });
    res.json(leaves);
  } catch (error) {
    next(error);
  }
});

// PATCH /Leaves/activate/:id
router.patch('/activate/:id', async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    leave.leaveStatus = 'PENDING';
    leave.updatedDate = new Date();
    await leave.save();

    res.json({ message: 'Leave request activated' });
  } catch (error) {
    next(error);
  }
});

// PATCH /Leaves/deactivate/:id
router.patch('/deactivate/:id', async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    leave.leaveStatus = 'REJECTED';
    leave.updatedDate = new Date();
    await leave.save();

    res.json({ message: 'Leave request deactivated' });
  } catch (error) {
    next(error);
  }
});

// PUT /Leaves/deactivate/:id (support PUT as well)
router.put('/deactivate/:id', async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    leave.leaveStatus = 'REJECTED';
    leave.updatedDate = new Date();
    await leave.save();

    res.json({ message: 'Leave request deactivated' });
  } catch (error) {
    next(error);
  }
});

// PATCH /Leaves/approve/:id
router.patch('/approve/:id', async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    leave.leaveStatus = 'APPROVED';
    leave.updatedDate = new Date();
    await leave.save();

    try {
      broadcast({
        type: 'LEAVE_APPROVED',
        message: `Leave request ${req.params.id} has been approved`,
        data: leave
      });
    } catch (e) {}

    res.json({ message: 'Leave request approved' });
  } catch (error) {
    next(error);
  }
});

// PATCH /Leaves/reject/:id
router.patch('/reject/:id', async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    leave.leaveStatus = 'REJECTED';
    leave.updatedDate = new Date();
    await leave.save();

    try {
      broadcast({
        type: 'LEAVE_REJECTED',
        message: `Leave request ${req.params.id} has been rejected`,
        data: leave
      });
    } catch (e) {}

    res.json({ message: 'Leave request rejected' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
