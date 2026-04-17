const Timesheet = require('../models/Timesheet');

const createTimesheet = async (data) => {
  const entry = new Timesheet({ ...data, createdDate: new Date() });
  return await entry.save();
};

const getAllTimesheets = async () => {
  return await Timesheet.find().populate('userId', 'firstname lastname userName').populate('project', 'name projectId');
};

const getTimesheetById = async (id) => {
  const entry = await Timesheet.findById(id).populate('userId', 'firstname lastname userName').populate('project', 'name projectId');
  if (!entry) throw { status: 404, message: 'Timesheet entry not found' };
  return entry;
};

const getTimesheetsByStatus = async (status) => {
  return await Timesheet.find({ status }).populate('userId', 'firstname lastname userName').populate('project', 'name projectId');
};

const getTimesheetsByUser = async (userId) => {
  return await Timesheet.find({ userId }).populate('project', 'name projectId');
};

const updateTimesheet = async (id, data) => {
  const entry = await Timesheet.findById(id);
  if (!entry) throw { status: 404, message: 'Timesheet entry not found' };
  Object.assign(entry, data, { updatedDate: new Date() });
  return await entry.save();
};

const updateTimesheetStatus = async (id, status) => {
  const entry = await Timesheet.findById(id);
  if (!entry) throw { status: 404, message: 'Timesheet entry not found' };
  entry.status = status;
  entry.updatedDate = new Date();
  return await entry.save();
};

const deleteTimesheet = async (id) => {
  const result = await Timesheet.findByIdAndDelete(id);
  if (!result) throw { status: 404, message: 'Timesheet entry not found' };
};

module.exports = {
  createTimesheet,
  getAllTimesheets,
  getTimesheetById,
  getTimesheetsByStatus,
  getTimesheetsByUser,
  updateTimesheet,
  updateTimesheetStatus,
  deleteTimesheet
};
