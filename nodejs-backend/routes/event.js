const express = require('express');
const router = express.Router();
const eventService = require('../services/eventService');
const { authenticate, authorize } = require('../middleware/auth');
const { broadcast } = require('../config/socket');

router.post('/create', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try {
    const event = await eventService.createEvent({ ...req.body, createdBy: req.user.id });
    // Notify all users about new event
    broadcast({ type: 'NEW_EVENT', message: `New event: ${event.title} on ${new Date(event.date).toLocaleDateString('en-GB')}`, forAll: true });
    res.status(201).json(event);
  } catch (error) { next(error); }
});

router.get('/all', authenticate, async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();
    res.json(await eventService.getAllEvents(m, y));
  } catch (error) { next(error); }
});

router.get('/upcoming', authenticate, async (req, res, next) => {
  try {
    const days = req.query.days || 7;
    res.json(await eventService.getUpcomingEvents(days));
  } catch (error) { next(error); }
});

router.get('/holidays', authenticate, async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    res.json(await eventService.getHolidays(year));
  } catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try { res.json(await eventService.getEventById(req.params.id)); }
  catch (error) { next(error); }
});

router.put('/update/:id', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
  try { res.json(await eventService.updateEvent(req.params.id, req.body)); }
  catch (error) { next(error); }
});

router.delete('/delete/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { await eventService.deleteEvent(req.params.id); res.status(204).send(); }
  catch (error) { next(error); }
});

module.exports = router;
