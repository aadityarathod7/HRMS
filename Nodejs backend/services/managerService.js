const LeaveRequest = require('../models/LeaveRequest');
const { broadcast } = require('../config/socket');

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
    broadcast({
      type: 'STATUS_UPDATE',
      message: `Leave request ${leaveRequestId} has been ${status}`,
      data: updated
    });
  } catch (e) {}

  return `Leave request status updated to ${status}`;
};

module.exports = { updateLeaveStatus };
