const express = require('express');
const router = express.Router();
const attendanceService = require('../services/attendanceService');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/mark', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const entry = await attendanceService.markAttendance(req.body);
    res.status(201).json(entry);
  } catch (error) { next(error); }
});

router.get('/all', authenticate, async (req, res, next) => {
  try {
    const isAdminOrHR = req.user.roles.some(r => ['ADMIN', 'HR'].includes(r));
    if (isAdminOrHR) {
      const entries = await attendanceService.getAllAttendance();
      return res.json(entries);
    }
    const entries = await attendanceService.getAttendanceByUser(req.user.id);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/status/:status', authenticate, async (req, res, next) => {
  try {
    const entries = await attendanceService.getAttendanceByStatus(req.params.status);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/user/:userId', authenticate, async (req, res, next) => {
  try {
    const entries = await attendanceService.getAttendanceByUser(req.params.userId);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/date/:date', authenticate, async (req, res, next) => {
  try {
    const entries = await attendanceService.getAttendanceByDate(req.params.date);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const entry = await attendanceService.getAttendanceById(req.params.id);
    res.json(entry);
  } catch (error) { next(error); }
});

router.put('/update/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const entry = await attendanceService.updateAttendance(req.params.id, req.body);
    res.json(entry);
  } catch (error) { next(error); }
});

router.delete('/delete/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    await attendanceService.deleteAttendance(req.params.id);
    res.status(204).send();
  } catch (error) { next(error); }
});

module.exports = router;
