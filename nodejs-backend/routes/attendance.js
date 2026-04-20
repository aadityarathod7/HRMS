const express = require('express');
const router = express.Router();
const attendanceService = require('../services/attendanceService');
const { authenticate, authorize } = require('../middleware/auth');

// Self check-in — any authenticated employee
router.post('/checkin', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

    // Already checked in today?
    const Attendance = require('../models/Attendance');
    const existing = await Attendance.findOne({ userId, date: { $gte: todayStart, $lte: todayEnd } });
    if (existing) {
      return res.status(409).json({ message: 'Already checked in today', record: existing });
    }

    const checkIn = req.body.checkIn || `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const entry = await attendanceService.markAttendance({
      userId,
      date: now,
      checkIn,
      status: req.body.status || 'PRESENT',
      location: req.body.location || 'OFFICE',
      notes: req.body.notes || '',
    });
    res.status(201).json(entry);
  } catch (error) { next(error); }
});

// Self check-out — update today's record
router.put('/checkout', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

    const Attendance = require('../models/Attendance');
    const existing = await Attendance.findOne({ userId, date: { $gte: todayStart, $lte: todayEnd } });
    if (!existing) return res.status(404).json({ message: 'No check-in found for today. Please check in first.' });
    if (existing.checkOut) return res.status(409).json({ message: 'Already checked out today', record: existing });

    const checkOut = req.body.checkOut || `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    existing.checkOut = checkOut;
    if (req.body.notes) existing.notes = req.body.notes;
    await existing.save();
    res.json(existing);
  } catch (error) { next(error); }
});

// Get today's attendance for current user
router.get('/today', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const Attendance = require('../models/Attendance');
    const record = await Attendance.findOne({ userId, date: { $gte: todayStart, $lte: todayEnd } });
    res.json(record || null);
  } catch (error) { next(error); }
});

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
