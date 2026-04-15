const LeaveRequest = require('../models/LeaveRequest');
const { broadcast } = require('../config/socket');

const createLeaveRequest = async (data) => {
  const leave = new LeaveRequest({
    ...data,
    leaveStatus: 'PENDING',
    createdDate: new Date()
  });
  const saved = await leave.save();

  try {
    broadcast({
      type: 'NEW_REQUEST',
      message: `New leave request submitted by user ${data.userId}`,
      data: saved
    });
  } catch (e) {}

  return saved;
};

const updateLeaveRequest = async (id, data) => {
  const leave = await LeaveRequest.findById(id);
  if (!leave) throw { status: 404, message: 'Leave request not found' };

  leave.leaveStartDate = data.leaveStartDate || leave.leaveStartDate;
  leave.leaveEndDate = data.leaveEndDate || leave.leaveEndDate;
  leave.leaveType = data.leaveType || leave.leaveType;
  leave.description = data.description || leave.description;
  leave.updatedDate = new Date();

  return await leave.save();
};

const deleteLeaveRequest = async (id) => {
  const result = await LeaveRequest.findByIdAndDelete(id);
  if (!result) throw { status: 404, message: 'Leave request not found' };
};

const getLeaveRequestById = async (id) => {
  const leave = await LeaveRequest.findById(id);
  if (!leave) throw { status: 404, message: 'Leave request not found' };
  return leave;
};

const getAllLeaveRequests = async () => {
  return await LeaveRequest.find();
};

const getApprovedLeaves = async () => {
  return await LeaveRequest.find({ leaveStatus: 'APPROVED' });
};

const getPendingLeaves = async () => {
  return await LeaveRequest.find({ leaveStatus: 'PENDING' });
};

const getRejectedLeaves = async () => {
  return await LeaveRequest.find({ leaveStatus: 'REJECTED' });
};

const getLeavesByStatus = async (status) => {
  return await LeaveRequest.find({ leaveStatus: status });
};

module.exports = {
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequestById,
  getAllLeaveRequests,
  getApprovedLeaves,
  getPendingLeaves,
  getRejectedLeaves,
  getLeavesByStatus
};
