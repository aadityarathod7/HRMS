const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');

const addUser = async (userData, createdBy) => {
  const exists = await User.findOne({ userName: userData.userName });
  if (exists) {
    throw { status: 409, message: 'Username already exists' };
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const roleNames = userData.roles || [];
  const roles = await Role.find({ role: { $in: roleNames } });

  const user = new User({
    ...userData,
    password: hashedPassword,
    roles: roles.map(r => r._id),
    createdBy,
    createdDate: new Date()
  });

  await user.save();
  return 'User registered successfully';
};

const getAllUsers = async () => {
  const users = await User.find().populate('roles');
  return users.map(toDto);
};

const getUsersByActiveStatus = async (isActive) => {
  const users = await User.find({ isActive }).populate('roles');
  return users.map(toDto);
};

const getUserById = async (id) => {
  const user = await User.findById(id).populate('roles');
  if (!user) throw { status: 404, message: 'User not found' };
  return toDto(user);
};

const deactivateUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: 'User not found' };
  user.isActive = false;
  user.updatedDate = new Date();
  await user.save();
  return 'User deactivated successfully';
};

const activateUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: 'User not found' };
  user.isActive = true;
  user.updatedDate = new Date();
  await user.save();
  return 'User activated successfully';
};

const updateUser = async (id, userData, updatedBy) => {
  const user = await User.findById(id);
  if (!user) throw { status: 404, message: 'User not found' };

  const roleNames = userData.roles || [];
  const roles = await Role.find({ role: { $in: roleNames } });

  user.userName = userData.userName || user.userName;
  user.firstname = userData.firstname || user.firstname;
  user.lastname = userData.lastname || user.lastname;
  user.dob = userData.dob || user.dob;
  user.contactNumber = userData.contactNumber || user.contactNumber;
  user.branch = userData.branch || user.branch;
  user.bloodGroup = userData.bloodGroup || user.bloodGroup;
  user.dateOfJoining = userData.dateOfJoining || user.dateOfJoining;
  user.address = userData.address || user.address;
  user.email = userData.email || user.email;
  user.gender = userData.gender || user.gender;
  user.roles = roles.map(r => r._id);
  user.updatedBy = updatedBy;
  user.updatedDate = new Date();

  if (userData.password) {
    user.password = await bcrypt.hash(userData.password, 10);
  }

  await user.save();
  return 'User updated successfully';
};

const toDto = (user) => ({
  id: user._id,
  userName: user.userName,
  firstname: user.firstname,
  lastname: user.lastname,
  dob: user.dob,
  contactNumber: user.contactNumber,
  branch: user.branch,
  bloodGroup: user.bloodGroup,
  dateOfJoining: user.dateOfJoining,
  isActive: user.isActive,
  address: user.address,
  email: user.email,
  gender: user.gender,
  roles: user.roles,
  createdBy: user.createdBy,
  createdDate: user.createdDate,
  updatedBy: user.updatedBy,
  updatedDate: user.updatedDate
});

module.exports = {
  addUser,
  getAllUsers,
  getUsersByActiveStatus,
  getUserById,
  deactivateUser,
  activateUser,
  updateUser
};
