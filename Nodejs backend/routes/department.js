const express = require('express');
const router = express.Router();
const departmentService = require('../services/departmentService');
const { authenticate } = require('../middleware/auth');

// POST /departments/create
router.post('/create', authenticate, async (req, res, next) => {
  try {
    const dept = await departmentService.createDepartment(req.body, req.user.userName);
    res.status(201).json(dept);
  } catch (error) {
    next(error);
  }
});

// PUT /departments/update/:id
router.put('/update/:id', authenticate, async (req, res, next) => {
  try {
    const dept = await departmentService.updateById(req.params.id, req.body, req.user.userName);
    res.json(dept);
  } catch (error) {
    next(error);
  }
});

// PATCH /departments/activate/:id
router.patch('/activate/:id', async (req, res, next) => {
  try {
    await departmentService.activateDepartment(req.params.id);
    res.json({ message: 'Department activated successfully' });
  } catch (error) {
    next(error);
  }
});

// PATCH /departments/deactivate/:id
router.patch('/deactivate/:id', async (req, res, next) => {
  try {
    await departmentService.deactivateDepartment(req.params.id);
    res.json({ message: 'Department deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /departments/active
router.get('/active', async (req, res, next) => {
  try {
    const depts = await departmentService.getAllActive();
    res.json(depts);
  } catch (error) {
    next(error);
  }
});

// GET /departments/inactive
router.get('/inactive', async (req, res, next) => {
  try {
    const depts = await departmentService.getAllInactive();
    res.json(depts);
  } catch (error) {
    next(error);
  }
});

// GET /departments/:id (must be after static routes)
router.get('/:id', async (req, res, next) => {
  try {
    const dept = await departmentService.findById(req.params.id);
    res.json(dept);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
