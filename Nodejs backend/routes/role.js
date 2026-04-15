const express = require('express');
const router = express.Router();
const roleService = require('../services/roleService');
const { authenticate } = require('../middleware/auth');

// GET /role/active
router.get('/active', async (req, res, next) => {
  try {
    const roles = await roleService.getActiveRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
});

// GET /role/inactive
router.get('/inactive', async (req, res, next) => {
  try {
    const roles = await roleService.getInactiveRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
});

// POST /role/create
router.post('/create', authenticate, async (req, res, next) => {
  try {
    const createdBy = req.user.userName;
    const role = await roleService.createRole(req.body, createdBy);
    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
});

// GET /role/:roleId
router.get('/:roleId', async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.roleId);
    res.json(role);
  } catch (error) {
    next(error);
  }
});

// PATCH /role/deactivate/:id
router.patch('/deactivate/:id', authenticate, async (req, res, next) => {
  try {
    const role = await roleService.deactivateRole(req.params.id, req.user.userName);
    res.json(role);
  } catch (error) {
    next(error);
  }
});

// PUT /role/activate/:id
router.put('/activate/:id', authenticate, async (req, res, next) => {
  try {
    const role = await roleService.activateRole(req.params.id, req.user.userName);
    res.json(role);
  } catch (error) {
    next(error);
  }
});

// PUT /role/update/:id
router.put('/update/:id', authenticate, async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body, req.user.userName);
    res.json(role);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
