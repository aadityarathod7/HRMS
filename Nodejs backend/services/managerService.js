const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const { notifyLeaveAction } = require('../config/socket');

const updateLeaveStatus = async (leaveRequestId, status) => {
  if (!leaveRequestId || !status) {
    throw { status: 400, message: 'Leave request ID and status are required' };
  }

  const leave = await LeaveRequest.findById(leaveRequestId);
  if (!leave) throw { status: 404, message: 'Leave request not found' };

  leave.leaveStatus = status;
  leave.updatedDate = new Date();
  const updated = await leave.save();

  try {
    const emp = await User.findById(leave.userId).select('firstname lastname');
    const name = emp ? `${emp.firstname} ${emp.lastname}` : 'Employee';
    const action = status === 'APPROVED' ? 'approved' : status === 'REJECTED' ? 'rejected' : status.toLowerCase();
    notifyLeaveAction(
      { type: 'STATUS_UPDATE', message: `${name}'s leave has been ${action}` },
      leave.userId,
      leave.reportingManagerId
    );
  } catch (e) {}

  return `Leave request status updated to ${status}`;
};

module.exports = { updateLeaveStatus };
