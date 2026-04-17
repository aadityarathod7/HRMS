const Department = require('../models/Department');

const generateDeptCode = async () => {
  const last = await Department.findOne({ departmentCode: { $exists: true } }).sort({ departmentCode: -1 });
  if (!last || !last.departmentCode) return 'DEPT-001';
  const num = parseInt(last.departmentCode.split('-')[1]) + 1;
  return `DEPT-${num.toString().padStart(3, '0')}`;
};

const createDepartment = async (data, createdBy) => {
  const departmentCode = data.departmentCode || await generateDeptCode();
  const dept = new Department({
    departmentCode,
    departmentName: data.departmentName,
    description: data.description,
    contactPerson: data.contactPerson,
    headOfDepartment: data.headOfDepartment || undefined,
    createdBy,
    createdDate: new Date(),
    isActive: true
  });
  return await dept.save();
};

const updateById = async (id, data, updatedBy) => {
  const dept = await Department.findById(id);
  if (!dept) throw { status: 404, message: 'Department not found' };
  ['departmentName', 'description', 'contactPerson', 'headOfDepartment'].forEach(f => {
    if (data[f] !== undefined) dept[f] = data[f];
  });
  dept.updatedBy = updatedBy;
  dept.updatedDate = new Date();
  return await dept.save();
};

const activateDepartment = async (id) => {
  const dept = await Department.findById(id);
  if (!dept) throw { status: 404, message: 'Department not found' };
  dept.isActive = true; dept.updatedDate = new Date();
  return await dept.save();
};

const deactivateDepartment = async (id) => {
  const dept = await Department.findById(id);
  if (!dept) throw { status: 404, message: 'Department not found' };
  dept.isActive = false; dept.updatedDate = new Date();
  return await dept.save();
};

const findById = async (id) => {
  const dept = await Department.findById(id).populate('headOfDepartment', 'firstname lastname employeeId');
  if (!dept) throw { status: 404, message: 'Department not found' };
  return dept;
};

const getAllActive = async () => {
  return await Department.find({ isActive: true }).populate('headOfDepartment', 'firstname lastname');
};

const getAllInactive = async () => {
  return await Department.find({ isActive: false });
};

module.exports = { createDepartment, updateById, activateDepartment, deactivateDepartment, findById, getAllActive, getAllInactive };
