const express = require('express');
const router = express.Router();
const payrollService = require('../services/payrollService');

router.post('/create', async (req, res, next) => {
  try {
    const entry = await payrollService.createPayroll(req.body);
    res.status(201).json(entry);
  } catch (error) { next(error); }
});

router.get('/all', async (req, res, next) => {
  try {
    const entries = await payrollService.getAllPayrolls();
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/status/:status', async (req, res, next) => {
  try {
    const entries = await payrollService.getPayrollsByStatus(req.params.status);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/user/:userId', async (req, res, next) => {
  try {
    const entries = await payrollService.getPayrollsByUser(req.params.userId);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const entry = await payrollService.getPayrollById(req.params.id);
    res.json(entry);
  } catch (error) { next(error); }
});

router.put('/update/:id', async (req, res, next) => {
  try {
    const entry = await payrollService.updatePayroll(req.params.id, req.body);
    res.json(entry);
  } catch (error) { next(error); }
});

router.put('/updateStatus/:id', async (req, res, next) => {
  try {
    const { status } = req.query;
    const entry = await payrollService.updatePayrollStatus(req.params.id, status);
    res.json(entry);
  } catch (error) { next(error); }
});

router.delete('/delete/:id', async (req, res, next) => {
  try {
    await payrollService.deletePayroll(req.params.id);
    res.status(204).send();
  } catch (error) { next(error); }
});

module.exports = router;
