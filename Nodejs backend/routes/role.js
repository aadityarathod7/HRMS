const express = require('express');
const router = express.Router();
const roleService = require('../services/roleService');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/active', authenticate, async (req, res, next) => {
  try { res.json(await roleService.getActiveRoles()); }
  catch (error) { next(error); }
});

router.get('/inactive', authenticate, async (req, res, next) => {
  try { res.json(await roleService.getInactiveRoles()); }
  catch (error) { next(error); }
});

router.post('/create', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.status(201).json(await roleService.createRole(req.body, req.user.userName)); }
  catch (error) { next(error); }
});

router.get('/:roleId', authenticate, async (req, res, next) => {
  try { res.json(await roleService.getRoleById(req.params.roleId)); }
  catch (error) { next(error); }
});

router.patch('/deactivate/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.json(await roleService.deactivateRole(req.params.id, req.user.userName)); }
  catch (error) { next(error); }
});

router.put('/activate/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.json(await roleService.activateRole(req.params.id, req.user.userName)); }
  catch (error) { next(error); }
});

router.put('/update/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.json(await roleService.updateRole(req.params.id, req.body, req.user.userName)); }
  catch (error) { next(error); }
});

module.exports = router;
