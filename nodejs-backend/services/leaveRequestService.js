const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const { notifyLeaveAction } = require('../config/socket');

const getUserName = async (userId) => {
  try {
    const user = await User.findById(userId).select('firstname lastname');
    return user ? `${user.firstname} ${user.lastname}` : 'Unknown';
  } catch (e) { return 'Unknown'; }
};

const createLeaveRequest = async (data) => {
  if (!data.leaveStartDate || !data.leaveEndDate) {
    throw { status: 400, message: 'Leave start date and end date are required' };
  }

  // Sanitize halfDayType — remove if empty string (fails enum)
  if (!data.halfDayType) delete data.halfDayType;

  // Check leave balance (skip for LOP)
  if (data.leaveType !== 'LOP') {
    const year = new Date(data.leaveStartDate).getFullYear();
    if (isNaN(year)) throw { status: 400, message: 'Invalid leave start date' };
    const balance = await LeaveBalance.findOne({ userId: data.userId, leaveType: data.leaveType, year });
    if (!balance) throw { status: 400, message: `No ${data.leaveType} balance found for this year` };

    const startDate = new Date(data.leaveStartDate);
    const endDate = new Date(data.leaveEndDate);
    const diffDays = data.halfDay ? 0.5 : Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    if (balance.available < diffDays) {
      throw { status: 400, message: `Insufficient ${data.leaveType} balance. Available: ${balance.available}, Requested: ${diffDays}` };
    }
  }

  const leave = new LeaveRequest({ ...data, leaveStatus: 'PENDING', createdDate: new Date() });
  const saved = await leave.save();

  try {
    const name = await getUserName(data.userId);
    notifyLeaveAction({ type: 'NEW_LEAVE_REQUEST', message: `${name} applied for ${saved.leaveType} leave (${saved.numberOfDays} days)`, forRoles: ['HR', 'ADMIN', 'MANAGER'], forUser: data.reportingManagerId?.toString() });
  } catch (e) {}
  return saved;
};

const approveLeaveRequest = async (leaveId, approvedById) => {
  const leave = await LeaveRequest.findById(leaveId);
  if (!leave) throw { status: 404, message: 'Leave request not found' };
  if (leave.leaveStatus !== 'PENDING') throw { status: 400, message: 'Leave is not in PENDING state' };

  leave.leaveStatus = 'APPROVED';
  leave.approvedBy = approvedById;
  leave.approvalDate = new Date();
  leave.updatedDate = new Date();
  await leave.save();

  // Deduct from balance (skip LOP)
  if (leave.leaveType !== 'LOP') {
    const year = new Date(leave.leaveStartDate).getFullYear();
    const balance = await LeaveBalance.findOne({ userId: leave.userId, leaveType: leave.leaveType, year });
    if (balance) {
      balance.used += leave.numberOfDays;
      balance.available = balance.totalAllotted - balance.used;
      await balance.save();
    }
  }

  try {
    const name = await getUserName(leave.userId);
    notifyLeaveAction({ type: 'LEAVE_APPROVED', forUser: leave.userId?.toString(), userMessage: `Your ${leave.leaveType} leave has been approved`, forRoles: ['HR', 'ADMIN'], roleMessage: `${name}'s ${leave.leaveType} leave has been approved` });
  } catch (e) {}
  return leave;
};

const rejectLeaveRequest = async (leaveId, rejectedById, rejectionReason) => {
  const leave = await LeaveRequest.findById(leaveId);
  if (!leave) throw { status: 404, message: 'Leave request not found' };
  if (leave.leaveStatus !== 'PENDING') throw { status: 400, message: 'Only PENDING leaves can be rejected' };

  leave.leaveStatus = 'REJECTED';
  leave.approvedBy = rejectedById;  // reusing field as "processedBy"
  leave.rejectionReason = rejectionReason || 'Rejected by manager';
  leave.updatedDate = new Date();
  await leave.save();

  try {
    const name = await getUserName(leave.userId);
    notifyLeaveAction({ type: 'LEAVE_REJECTED', forUser: leave.userId?.toString(), userMessage: `Your ${leave.leaveType} leave has been rejected`, forRoles: ['HR', 'ADMIN'], roleMessage: `${name}'s ${leave.leaveType} leave has been rejected` });
  } catch (e) {}
  return leave;
};

const cancelLeaveRequest = async (leaveId) => {
  const leave = await LeaveRequest.findById(leaveId);
  if (!leave) throw { status: 404, message: 'Leave request not found' };

  const now = new Date();
  if (leave.leaveStatus === 'APPROVED' && new Date(leave.leaveStartDate) <= now) {
    throw { status: 400, message: 'Cannot cancel a leave that has already started' };
  }

  // Restore balance if was approved
  if (leave.leaveStatus === 'APPROVED' && leave.leaveType !== 'LOP') {
    const year = new Date(leave.leaveStartDate).getFullYear();
    const balance = await LeaveBalance.findOne({ userId: leave.userId, leaveType: leave.leaveType, year });
    if (balance) {
      balance.used -= leave.numberOfDays;
      balance.available = balance.totalAllotted - balance.used;
      await balance.save();
    }
  }

  leave.leaveStatus = 'CANCELLED';
  leave.updatedDate = new Date();
  await leave.save();
  return leave;
};

const updateLeaveRequest = async (id, data) => {
  const leave = await LeaveRequest.findById(id);
  if (!leave) throw { status: 404, message: 'Leave request not found' };
  if (leave.leaveStatus !== 'PENDING') throw { status: 400, message: 'Can only edit PENDING leaves' };

  ['leaveStartDate', 'leaveEndDate', 'leaveType', 'description', 'halfDay', 'halfDayType'].forEach(f => {
    if (data[f] !== undefined) leave[f] = data[f];
  });
  leave.updatedDate = new Date();
  return await leave.save();
};

const deleteLeaveRequest = async (id) => {
  const result = await LeaveRequest.findByIdAndDelete(id);
  if (!result) throw { status: 404, message: 'Leave request not found' };
};

const getLeaveRequestById = async (id) => {
  const leave = await LeaveRequest.findById(id)
    .populate('userId', 'firstname lastname employeeId')
    .populate('reportingManagerId', 'firstname lastname')
    .populate('approvedBy', 'firstname lastname');
  if (!leave) throw { status: 404, message: 'Leave request not found' };
  return leave;
};

const getAllLeaveRequests = async () => {
  return await LeaveRequest.find()
    .populate('userId', 'firstname lastname employeeId')
    .populate('reportingManagerId', 'firstname lastname')
    .populate('approvedBy', 'firstname lastname')
    .sort({ createdDate: -1 });
};

const getLeavesByStatus = async (status) => {
  return await LeaveRequest.find({ leaveStatus: status })
    .populate('userId', 'firstname lastname employeeId')
    .populate('reportingManagerId', 'firstname lastname')
    .populate('approvedBy', 'firstname lastname')
    .sort({ createdDate: -1 });
};

const getLeavesByUser = async (userId) => {
  return await LeaveRequest.find({ userId })
    .populate('reportingManagerId', 'firstname lastname')
    .sort({ createdDate: -1 });
};

const getLeaveBalance = async (userId, year) => {
  return await LeaveBalance.find({ userId, year });
};

const getApprovedLeaves = () => getLeavesByStatus('APPROVED');
const getPendingLeaves = () => getLeavesByStatus('PENDING');
const getRejectedLeaves = () => getLeavesByStatus('REJECTED');

module.exports = {
  createLeaveRequest, approveLeaveRequest, rejectLeaveRequest, cancelLeaveRequest,
  updateLeaveRequest, deleteLeaveRequest, getLeaveRequestById,
  getAllLeaveRequests, getApprovedLeaves, getPendingLeaves, getRejectedLeaves,
  getLeavesByStatus, getLeavesByUser, getLeaveBalance
};
