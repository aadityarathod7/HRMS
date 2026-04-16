const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');

const generateEmployeeId = async () => {
  const last = await User.findOne({ employeeId: { $exists: true, $ne: null } }).sort({ employeeId: -1 });
  if (!last || !last.employeeId) return 'SANVII-EMP-001';
  const num = parseInt(last.employeeId.split('-').pop()) + 1;
  return `SANVII-EMP-${num.toString().padStart(3, '0')}`;
};

const addUser = async (userData, createdBy) => {
  const exists = await User.findOne({ userName: userData.userName });
  if (exists) throw { status: 409, message: 'Username already exists' };

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const roleNames = userData.roles || [];
  const roles = await Role.find({ role: { $in: roleNames } });
  const employeeId = await generateEmployeeId();

  const user = new User({
    ...userData,
    employeeId,
    password: hashedPassword,
    roles: roles.map(r => r._id),
    status: 'PROBATION',
    isActive: true,
    createdBy,
    createdDate: new Date()
  });

  await user.save();
  return 'Employee registered successfully with ID: ' + employeeId;
};

const getAllUsers = async () => {
  const users = await User.find()
    .populate('roles')
    .populate('department', 'departmentName departmentCode')
    .populate('reportingManager', 'firstname lastname employeeId');
  return users.map(toDto);
};

const getUsersByActiveStatus = async (isActive) => {
  const users = await User.find({ isActive })
    .populate('roles')
    .populate('department', 'departmentName departmentCode')
    .populate('reportingManager', 'firstname lastname employeeId');
  return users.map(toDto);
};

const getUserById = async (id) => {
  const user = await User.findById(id)
    .populate('roles')
    .populate('department', 'departmentName departmentCode')
    .populate('reportingManager', 'firstname lastname employeeId');
  if (!user) throw { status: 404, message: 'User not found' };
  return toDto(user);
};

const deactivateUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: 'User not found' };
  user.isActive = false;
  user.status = 'INACTIVE';
  user.updatedDate = new Date();
  await user.save();
  return 'User deactivated successfully';
};

const activateUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: 'User not found' };
  user.isActive = true;
  user.status = 'ACTIVE';
  user.updatedDate = new Date();
  await user.save();
  return 'User activated successfully';
};

const updateUser = async (id, userData, updatedBy) => {
  const user = await User.findById(id);
  if (!user) throw { status: 404, message: 'User not found' };

  const roleNames = userData.roles || [];
  const roles = roleNames.length ? await Role.find({ role: { $in: roleNames } }) : user.roles;

  const fields = ['userName', 'firstname', 'lastname', 'dob', 'contactNumber', 'branch', 'bloodGroup',
    'dateOfJoining', 'address', 'email', 'gender', 'department', 'designation', 'reportingManager',
    'employmentType', 'ctc', 'bankAccountNumber', 'bankName', 'ifscCode', 'panNumber', 'aadharNumber',
    'emergencyContactName', 'emergencyContactNumber', 'profilePicture', 'status', 'noticePeriod'];

  fields.forEach(f => { if (userData[f] !== undefined) user[f] = userData[f]; });
  user.roles = roleNames.length ? roles.map(r => r._id) : user.roles;
  user.updatedBy = updatedBy;
  user.updatedDate = new Date();

  if (userData.password) {
    user.password = await bcrypt.hash(userData.password, 10);
  }

  await user.save();
  return 'User updated successfully';
};

const getTeamMembers = async (managerId) => {
  const team = await User.find({ reportingManager: managerId, isActive: true })
    .populate('roles')
    .populate('department', 'departmentName');
  return team.map(toDto);
};

const toDto = (user) => ({
  id: user._id,
  employeeId: user.employeeId,
  userName: user.userName,
  firstname: user.firstname,
  lastname: user.lastname,
  dob: user.dob,
  contactNumber: user.contactNumber,
  branch: user.branch,
  bloodGroup: user.bloodGroup,
  dateOfJoining: user.dateOfJoining,
  isActive: user.isActive,
  status: user.status,
  address: user.address,
  email: user.email,
  gender: user.gender,
  department: user.department,
  designation: user.designation,
  reportingManager: user.reportingManager,
  employmentType: user.employmentType,
  ctc: user.ctc,
  emergencyContactName: user.emergencyContactName,
  emergencyContactNumber: user.emergencyContactNumber,
  roles: user.roles,
  createdBy: user.createdBy,
  createdDate: user.createdDate,
  updatedBy: user.updatedBy,
  updatedDate: user.updatedDate
});

module.exports = {
  addUser, getAllUsers, getUsersByActiveStatus, getUserById,
  deactivateUser, activateUser, updateUser, getTeamMembers
};
