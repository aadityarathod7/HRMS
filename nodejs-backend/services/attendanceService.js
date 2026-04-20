const Attendance = require('../models/Attendance');

const markAttendance = async (data) => {
  if (!data.userId || !data.date || !data.status) {
    throw { status: 400, message: 'userId, date, and status are required' };
  }
  // Prevent duplicate attendance for same user on same date
  const dateObj = new Date(data.date);
  dateObj.setHours(0, 0, 0, 0);
  const nextDay = new Date(dateObj);
  nextDay.setDate(nextDay.getDate() + 1);
  const existing = await Attendance.findOne({ userId: data.userId, date: { $gte: dateObj, $lt: nextDay } });
  if (existing) throw { status: 409, message: 'Attendance already marked for this employee on this date' };
  const entry = new Attendance({ ...data, createdDate: new Date() });
  return await entry.save();
};

const getAllAttendance = async () => {
  return await Attendance.find().populate('userId', 'firstname lastname userName').sort({ date: -1 });
};

const getAttendanceById = async (id) => {
  const entry = await Attendance.findById(id).populate('userId', 'firstname lastname userName');
  if (!entry) throw { status: 404, message: 'Attendance record not found' };
  return entry;
};

const getAttendanceByStatus = async (status) => {
  return await Attendance.find({ status }).populate('userId', 'firstname lastname userName').sort({ date: -1 });
};

const getAttendanceByUser = async (userId) => {
  return await Attendance.find({ userId }).populate('userId', 'firstname lastname userName').sort({ date: -1 });
};

const getAttendanceByDate = async (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return await Attendance.find({ date: { $gte: start, $lte: end } }).populate('userId', 'firstname lastname userName');
};

const updateAttendance = async (id, data) => {
  const entry = await Attendance.findById(id);
  if (!entry) throw { status: 404, message: 'Attendance record not found' };
  const allowed = ['status', 'checkIn', 'checkOut', 'notes', 'location'];
  allowed.forEach(f => { if (data[f] !== undefined) entry[f] = data[f]; });
  return await entry.save();
};

const deleteAttendance = async (id) => {
  const result = await Attendance.findByIdAndDelete(id);
  if (!result) throw { status: 404, message: 'Attendance record not found' };
};

module.exports = {
  markAttendance,
  getAllAttendance,
  getAttendanceById,
  getAttendanceByStatus,
  getAttendanceByUser,
  getAttendanceByDate,
  updateAttendance,
  deleteAttendance
};
