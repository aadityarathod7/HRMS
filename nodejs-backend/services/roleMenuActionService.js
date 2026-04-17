const RoleMenuAction = require('../models/RoleMenuAction');

const hasPermission = async (roleId, menuItemId, menuActionId) => {
  const permissions = await RoleMenuAction.find({
    role: roleId,
    menuItem: menuItemId,
    menuAction: menuActionId
  });

  if (!permissions.length) return false;
  return permissions.some(p => p.isAllowed);
};

module.exports = { hasPermission };
