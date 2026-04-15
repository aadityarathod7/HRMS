const express = require('express');
const router = express.Router();
const leaveRequestService = require('../services/leaveRequestService');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/submit', authenticate, async (req, res, next) => {
  try { res.status(201).json(await leaveRequestService.createLeaveRequest(req.body)); }
  catch (error) { next(error); }
});

router.put('/update/:id', authenticate, async (req, res, next) => {
  try { res.json(await leaveRequestService.updateLeaveRequest(req.params.id, req.body)); }
  catch (error) { next(error); }
});

router.delete('/delete/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { await leaveRequestService.deleteLeaveRequest(req.params.id); res.status(204).send(); }
  catch (error) { next(error); }
});

router.get('/approved', authenticate, async (req, res, next) => {
  try { res.json(await leaveRequestService.getApprovedLeaves()); }
  catch (error) { next(error); }
});

router.get('/pending', authenticate, async (req, res, next) => {
  try { res.json(await leaveRequestService.getPendingLeaves()); }
  catch (error) { next(error); }
});

router.get('/rejected', authenticate, async (req, res, next) => {
  try { res.json(await leaveRequestService.getRejectedLeaves()); }
  catch (error) { next(error); }
});

router.get('/status/:status', authenticate, async (req, res, next) => {
  try { res.json(await leaveRequestService.getLeavesByStatus(req.params.status)); }
  catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try { res.json(await leaveRequestService.getLeaveRequestById(req.params.id)); }
  catch (error) { next(error); }
});

router.get('/', authenticate, async (req, res, next) => {
  try { res.json(await leaveRequestService.getAllLeaveRequests()); }
  catch (error) { next(error); }
});

module.exports = router;
