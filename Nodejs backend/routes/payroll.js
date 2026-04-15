const express = require('express');
const router = express.Router();
const payrollService = require('../services/payrollService');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/create', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const entry = await payrollService.createPayroll(req.body);
    res.status(201).json(entry);
  } catch (error) { next(error); }
});

router.get('/all', authenticate, async (req, res, next) => {
  try {
    const isAdminOrHR = req.user.roles.some(r => ['ADMIN', 'HR'].includes(r));
    if (isAdminOrHR) {
      const entries = await payrollService.getAllPayrolls();
      return res.json(entries);
    }
    const entries = await payrollService.getPayrollsByUser(req.user.id);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/status/:status', authenticate, async (req, res, next) => {
  try {
    const entries = await payrollService.getPayrollsByStatus(req.params.status);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/user/:userId', authenticate, async (req, res, next) => {
  try {
    const entries = await payrollService.getPayrollsByUser(req.params.userId);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const entry = await payrollService.getPayrollById(req.params.id);
    res.json(entry);
  } catch (error) { next(error); }
});

router.put('/update/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const entry = await payrollService.updatePayroll(req.params.id, req.body);
    res.json(entry);
  } catch (error) { next(error); }
});

router.put('/updateStatus/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const { status } = req.query;
    const entry = await payrollService.updatePayrollStatus(req.params.id, status);
    res.json(entry);
  } catch (error) { next(error); }
});

router.delete('/delete/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    await payrollService.deletePayroll(req.params.id);
    res.status(204).send();
  } catch (error) { next(error); }
});

module.exports = router;
