const express = require('express');
const router = express.Router();
const leaveRequestService = require('../services/leaveRequestService');

// POST /leaverequests/submit
router.post('/submit', async (req, res, next) => {
  try {
    const leave = await leaveRequestService.createLeaveRequest(req.body);
    res.status(201).json(leave);
  } catch (error) {
    next(error);
  }
});

// PUT /leaverequests/update/:id
router.put('/update/:id', async (req, res, next) => {
  try {
    const leave = await leaveRequestService.updateLeaveRequest(req.params.id, req.body);
    res.json(leave);
  } catch (error) {
    next(error);
  }
});

// DELETE /leaverequests/delete/:id
router.delete('/delete/:id', async (req, res, next) => {
  try {
    await leaveRequestService.deleteLeaveRequest(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /leaverequests/:id
router.get('/approved', async (req, res, next) => {
  try {
    const leaves = await leaveRequestService.getApprovedLeaves();
    res.json(leaves);
  } catch (error) {
    next(error);
  }
});

router.get('/pending', async (req, res, next) => {
  try {
    const leaves = await leaveRequestService.getPendingLeaves();
    res.json(leaves);
  } catch (error) {
    next(error);
  }
});

router.get('/rejected', async (req, res, next) => {
  try {
    const leaves = await leaveRequestService.getRejectedLeaves();
    res.json(leaves);
  } catch (error) {
    next(error);
  }
});

router.get('/status/:status', async (req, res, next) => {
  try {
    const leaves = await leaveRequestService.getLeavesByStatus(req.params.status);
    res.json(leaves);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const leave = await leaveRequestService.getLeaveRequestById(req.params.id);
    res.json(leave);
  } catch (error) {
    next(error);
  }
});

// GET /leaverequests/
router.get('/', async (req, res, next) => {
  try {
    const leaves = await leaveRequestService.getAllLeaveRequests();
    res.json(leaves);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
