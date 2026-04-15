const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const roleMenuActionService = require('../services/roleMenuActionService');
const { authenticate } = require('../middleware/auth');

// POST /user/register
router.post('/register', async (req, res, next) => {
  try {
    const createdBy = req.user ? req.user.userName : 'system';
    const result = await userService.addUser(req.body, createdBy);
    res.status(201).json({ message: result });
  } catch (error) {
    next(error);
  }
});

// GET /user/all
router.get('/all', async (req, res, next) => {
  try {
    const { isActive } = req.query;
    let users;
    if (isActive !== undefined) {
      users = await userService.getUsersByActiveStatus(isActive === 'true' || isActive === '1');
    } else {
      users = await userService.getAllUsers();
    }
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET /user/check
router.get('/check', async (req, res, next) => {
  try {
    const { roleId, menuItemId, menuActionId } = req.query;
    const hasAccess = await roleMenuActionService.hasPermission(roleId, menuItemId, menuActionId);
    res.json(hasAccess);
  } catch (error) {
    next(error);
  }
});

// GET /user/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /user/deactivate/:userId
router.put('/deactivate/:userId', async (req, res, next) => {
  try {
    const result = await userService.deactivateUser(req.params.userId);
    res.json({ message: result });
  } catch (error) {
    next(error);
  }
});

// PUT /user/activate/:userId
router.put('/activate/:userId', async (req, res, next) => {
  try {
    const result = await userService.activateUser(req.params.userId);
    res.json({ message: result });
  } catch (error) {
    next(error);
  }
});

// PUT /user/update/:id
router.put('/update/:id', authenticate, async (req, res, next) => {
  try {
    const updatedBy = req.user.userName;
    const result = await userService.updateUser(req.params.id, req.body, updatedBy);
    res.json({ message: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
