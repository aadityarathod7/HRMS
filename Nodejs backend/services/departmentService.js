const Department = require('../models/Department');

const createDepartment = async (data, createdBy) => {
  const dept = new Department({
    departmentName: data.departmentName,
    contactPerson: data.contactPerson,
    createdBy,
    createdDate: new Date(),
    isActive: true
  });
  return await dept.save();
};

const updateById = async (id, data, updatedBy) => {
  const dept = await Department.findById(id);
  if (!dept) throw { status: 404, message: 'Department not found' };
  dept.departmentName = data.departmentName || dept.departmentName;
  dept.contactPerson = data.contactPerson || dept.contactPerson;
  dept.updatedBy = updatedBy;
  dept.updatedDate = new Date();
  return await dept.save();
};

const activateDepartment = async (id) => {
  const dept = await Department.findById(id);
  if (!dept) throw { status: 404, message: 'Department not found' };
  dept.isActive = true;
  dept.updatedDate = new Date();
  return await dept.save();
};

const deactivateDepartment = async (id) => {
  const dept = await Department.findById(id);
  if (!dept) throw { status: 404, message: 'Department not found' };
  dept.isActive = false;
  dept.updatedDate = new Date();
  return await dept.save();
};

const findById = async (id) => {
  const dept = await Department.findById(id);
  if (!dept) throw { status: 404, message: 'Department not found' };
  return dept;
};

const getAllActive = async () => {
  return await Department.find({ isActive: true });
};

const getAllInactive = async () => {
  return await Department.find({ isActive: false });
};

module.exports = {
  createDepartment,
  updateById,
  activateDepartment,
  deactivateDepartment,
  findById,
  getAllActive,
  getAllInactive
};
