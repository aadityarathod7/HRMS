const express = require('express');
const router = express.Router();
const projectService = require('../services/projectService');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/create', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.status(201).json(await projectService.createProject(req.body, req.user.userName)); }
  catch (error) { next(error); }
});

router.put('/update/:id?', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const projectId = req.params.id || req.query.projectId;
    res.json(await projectService.updateProject(projectId, req.body));
  } catch (error) { next(error); }
});

router.get('/all', authenticate, async (req, res, next) => {
  try { res.json(await projectService.getAllProjects()); }
  catch (error) { next(error); }
});

router.put('/UpdateStatus', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { const { projectId, status } = req.query; res.json(await projectService.updateProjectStatus(projectId, status)); }
  catch (error) { next(error); }
});

router.patch('/activate/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.json(await projectService.updateProjectStatus(req.params.id, 'ACTIVE')); }
  catch (error) { next(error); }
});

router.patch('/deactivate/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.json(await projectService.updateProjectStatus(req.params.id, 'INACTIVE')); }
  catch (error) { next(error); }
});

router.put('/deactivate/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.json(await projectService.updateProjectStatus(req.params.id, 'INACTIVE')); }
  catch (error) { next(error); }
});

router.put('/activate/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.json(await projectService.updateProjectStatus(req.params.id, 'ACTIVE')); }
  catch (error) { next(error); }
});

router.get('/getByStatus/:status', authenticate, async (req, res, next) => {
  try { res.json(await projectService.getProjectsByStatus(req.params.status)); }
  catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try { res.json(await projectService.getProjectById(req.params.id)); }
  catch (error) { next(error); }
});

module.exports = router;
