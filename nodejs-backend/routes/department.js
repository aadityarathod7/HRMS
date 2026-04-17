const express = require('express');
const router = express.Router();
const departmentService = require('../services/departmentService');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/create', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.status(201).json(await departmentService.createDepartment(req.body, req.user.userName)); }
  catch (error) { next(error); }
});

router.put('/update/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.json(await departmentService.updateById(req.params.id, req.body, req.user.userName)); }
  catch (error) { next(error); }
});

router.patch('/activate/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { await departmentService.activateDepartment(req.params.id); res.json({ message: 'Department activated successfully' }); }
  catch (error) { next(error); }
});

router.patch('/deactivate/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { await departmentService.deactivateDepartment(req.params.id); res.json({ message: 'Department deactivated successfully' }); }
  catch (error) { next(error); }
});

router.get('/active', authenticate, async (req, res, next) => {
  try { res.json(await departmentService.getAllActive()); }
  catch (error) { next(error); }
});

router.get('/inactive', authenticate, async (req, res, next) => {
  try { res.json(await departmentService.getAllInactive()); }
  catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try { res.json(await departmentService.findById(req.params.id)); }
  catch (error) { next(error); }
});

module.exports = router;
