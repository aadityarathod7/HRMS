const express = require('express');
const router = express.Router();
const timesheetService = require('../services/timesheetService');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/create', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const entry = await timesheetService.createTimesheet(req.body);
    res.status(201).json(entry);
  } catch (error) { next(error); }
});

router.get('/all', authenticate, async (req, res, next) => {
  try {
    const isAdminOrHR = req.user.roles.some(r => ['ADMIN', 'HR'].includes(r));
    if (isAdminOrHR) {
      const entries = await timesheetService.getAllTimesheets();
      return res.json(entries);
    }
    const entries = await timesheetService.getTimesheetsByUser(req.user.id);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/status/:status', authenticate, async (req, res, next) => {
  try {
    const entries = await timesheetService.getTimesheetsByStatus(req.params.status);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/user/:userId', authenticate, async (req, res, next) => {
  try {
    const entries = await timesheetService.getTimesheetsByUser(req.params.userId);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const entry = await timesheetService.getTimesheetById(req.params.id);
    res.json(entry);
  } catch (error) { next(error); }
});

router.put('/update/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const entry = await timesheetService.updateTimesheet(req.params.id, req.body);
    res.json(entry);
  } catch (error) { next(error); }
});

router.put('/updateStatus/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try {
    const { status } = req.query;
    const entry = await timesheetService.updateTimesheetStatus(req.params.id, status);
    res.json(entry);
  } catch (error) { next(error); }
});

router.delete('/delete/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    await timesheetService.deleteTimesheet(req.params.id);
    res.status(204).send();
  } catch (error) { next(error); }
});

module.exports = router;
