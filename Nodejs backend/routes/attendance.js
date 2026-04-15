const express = require('express');
const router = express.Router();
const attendanceService = require('../services/attendanceService');

router.post('/mark', async (req, res, next) => {
  try {
    const entry = await attendanceService.markAttendance(req.body);
    res.status(201).json(entry);
  } catch (error) { next(error); }
});

router.get('/all', async (req, res, next) => {
  try {
    const entries = await attendanceService.getAllAttendance();
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/status/:status', async (req, res, next) => {
  try {
    const entries = await attendanceService.getAttendanceByStatus(req.params.status);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/user/:userId', async (req, res, next) => {
  try {
    const entries = await attendanceService.getAttendanceByUser(req.params.userId);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/date/:date', async (req, res, next) => {
  try {
    const entries = await attendanceService.getAttendanceByDate(req.params.date);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const entry = await attendanceService.getAttendanceById(req.params.id);
    res.json(entry);
  } catch (error) { next(error); }
});

router.put('/update/:id', async (req, res, next) => {
  try {
    const entry = await attendanceService.updateAttendance(req.params.id, req.body);
    res.json(entry);
  } catch (error) { next(error); }
});

router.delete('/delete/:id', async (req, res, next) => {
  try {
    await attendanceService.deleteAttendance(req.params.id);
    res.status(204).send();
  } catch (error) { next(error); }
});

module.exports = router;
