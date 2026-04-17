const Role = require('../models/Role');

const getActiveRoles = async () => {
  return await Role.find({ isActive: true });
};

const getInactiveRoles = async () => {
  return await Role.find({ isActive: false });
};

const createRole = async (roleData, createdBy) => {
  const exists = await Role.findOne({ role: roleData.role });
  if (exists) {
    throw { status: 409, message: 'Role already exists' };
  }

  const role = new Role({
    ...roleData,
    createdBy,
    createdDate: new Date(),
    isActive: true
  });

  return await role.save();
};

const getRoleById = async (id) => {
  const role = await Role.findById(id);
  if (!role) throw { status: 404, message: 'Role not found' };
  return role;
};

const deactivateRole = async (id, updatedBy) => {
  const role = await Role.findById(id);
  if (!role) throw { status: 404, message: 'Role not found' };
  role.isActive = false;
  role.updatedBy = updatedBy;
  role.updatedDate = new Date();
  return await role.save();
};

const activateRole = async (id, updatedBy) => {
  const role = await Role.findById(id);
  if (!role) throw { status: 404, message: 'Role not found' };
  role.isActive = true;
  role.updatedBy = updatedBy;
  role.updatedDate = new Date();
  return await role.save();
};

const updateRole = async (id, roleData, updatedBy) => {
  const role = await Role.findById(id);
  if (!role) throw { status: 404, message: 'Role not found' };
  role.role = roleData.role || role.role;
  role.description = roleData.description || role.description;
  role.updatedBy = updatedBy;
  role.updatedDate = new Date();
  return await role.save();
};

module.exports = {
  getActiveRoles,
  getInactiveRoles,
  createRole,
  getRoleById,
  deactivateRole,
  activateRole,
  updateRole
};
