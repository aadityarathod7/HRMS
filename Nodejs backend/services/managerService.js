const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const { notifyLeaveAction } = require('../config/socket');

const updateLeaveStatus = async (leaveRequestId, status) => {
  if (!leaveRequestId || !status) {
    throw { status: 400, message: 'Leave request ID and status are required' };
  }

  const leave = await LeaveRequest.findById(leaveRequestId);
  if (!leave) throw { status: 404, message: 'Leave request not found' };

  const previousStatus = leave.leaveStatus;
  leave.leaveStatus = status;
  leave.updatedDate = new Date();
  await leave.save();

  // Update leave balance on APPROVE
  if (status === 'APPROVED' && previousStatus !== 'APPROVED' && leave.leaveType !== 'LOP') {
    const year = new Date(leave.leaveStartDate).getFullYear();
    const balance = await LeaveBalance.findOne({ userId: leave.userId, leaveType: leave.leaveType, year });
    if (balance) {
      balance.used += leave.numberOfDays || 1;
      balance.available = balance.totalAllotted - balance.used;
      await balance.save();
    }
  }

  // Restore balance on REJECT if was previously APPROVED
  if (status === 'REJECTED' && previousStatus === 'APPROVED' && leave.leaveType !== 'LOP') {
    const year = new Date(leave.leaveStartDate).getFullYear();
    const balance = await LeaveBalance.findOne({ userId: leave.userId, leaveType: leave.leaveType, year });
    if (balance) {
      balance.used -= leave.numberOfDays || 1;
      balance.available = balance.totalAllotted - balance.used;
      await balance.save();
    }
  }

  // Send notifications
  try {
    const emp = await User.findById(leave.userId).select('firstname lastname');
    const name = emp ? `${emp.firstname} ${emp.lastname}` : 'Employee';
    const action = status === 'APPROVED' ? 'approved' : status === 'REJECTED' ? 'rejected' : status.toLowerCase();
    // Notify the employee
    notifyLeaveAction({ type: 'STATUS_UPDATE', message: `Your ${leave.leaveType} leave has been ${action}`, forUser: leave.userId?.toString() });
    // Notify HR/Admin (different message)
    notifyLeaveAction({ type: 'STATUS_UPDATE', message: `${name}'s ${leave.leaveType} leave has been ${action}`, forRoles: ['HR', 'ADMIN'] });
  } catch (e) {}

  return `Leave request status updated to ${status}`;
};

module.exports = { updateLeaveStatus };
