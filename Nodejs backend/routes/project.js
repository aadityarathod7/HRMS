const express = require('express');
const router = express.Router();
const projectService = require('../services/projectService');
const { authenticate } = require('../middleware/auth');

// POST /project/create
router.post('/create', async (req, res, next) => {
  try {
    const createdBy = req.user ? req.user.userName : 'system';
    const project = await projectService.createProject(req.body, createdBy);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// PUT /project/update (query param or path param)
router.put('/update/:id?', async (req, res, next) => {
  try {
    const projectId = req.params.id || req.query.projectId;
    const project = await projectService.updateProject(projectId, req.body);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// GET /project/all
router.get('/all', async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// PUT /project/UpdateStatus
router.put('/UpdateStatus', async (req, res, next) => {
  try {
    const { projectId, status } = req.query;
    const project = await projectService.updateProjectStatus(projectId, status);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// PATCH /project/activate/:id
router.patch('/activate/:id', async (req, res, next) => {
  try {
    const project = await projectService.updateProjectStatus(req.params.id, 'ACTIVE');
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// PATCH /project/deactivate/:id
router.patch('/deactivate/:id', async (req, res, next) => {
  try {
    const project = await projectService.updateProjectStatus(req.params.id, 'INACTIVE');
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// PUT /project/deactivate/:id (also support PUT for frontend compatibility)
router.put('/deactivate/:id', async (req, res, next) => {
  try {
    const project = await projectService.updateProjectStatus(req.params.id, 'INACTIVE');
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// PUT /project/activate/:id
router.put('/activate/:id', async (req, res, next) => {
  try {
    const project = await projectService.updateProjectStatus(req.params.id, 'ACTIVE');
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// GET /project/getByStatus/:status
router.get('/getByStatus/:status', async (req, res, next) => {
  try {
    const projects = await projectService.getProjectsByStatus(req.params.status);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// GET /project/:id
router.get('/:id', async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
