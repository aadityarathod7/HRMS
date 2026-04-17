const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const eventService = require('./eventService');
const Timesheet = require('../models/Timesheet');
const Department = require('../models/Department');

const getAdminStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalEmployees, activeEmployees, newJoiners,
    pendingLeaves, onLeaveToday,
    presentToday, absentToday, wfhToday,
    departments, pendingTimesheets
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ dateOfJoining: { $gte: firstOfMonth }, isActive: true }),
    LeaveRequest.countDocuments({ leaveStatus: 'PENDING' }),
    LeaveRequest.countDocuments({ leaveStatus: 'APPROVED', leaveStartDate: { $lte: today }, leaveEndDate: { $gte: today } }),
    Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'PRESENT' }),
    Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'ABSENT' }),
    Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'WFH' }),
    Department.find({ isActive: true }).select('departmentName'),
    Timesheet.countDocuments({ status: 'PENDING' })
  ]);

  // Department-wise headcount
  const deptHeadcount = await User.aggregate([
    { $match: { isActive: true, department: { $exists: true } } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
    { $unwind: '$dept' },
    { $project: { department: '$dept.departmentName', count: 1 } }
  ]);

  // Upcoming birthdays (next 7 days)
  const next7Days = new Date(today);
  next7Days.setDate(next7Days.getDate() + 7);
  const allUsers = await User.find({ isActive: true, dob: { $exists: true } }).select('firstname lastname dob department').populate('department', 'departmentName');
  const upcomingBirthdays = allUsers.filter(u => {
    if (!u.dob) return false;
    const bday = new Date(u.dob);
    bday.setFullYear(today.getFullYear());
    return bday >= today && bday <= next7Days;
  }).map(u => ({ name: `${u.firstname} ${u.lastname}`, date: u.dob, department: u.department?.departmentName }));

  const upcomingEvents = await eventService.getUpcomingEvents(7);

  return {
    totalEmployees, activeEmployees, newJoiners,
    pendingLeaves, onLeaveToday,
    attendanceToday: { present: presentToday, absent: absentToday, wfh: wfhToday },
    departmentHeadcount: deptHeadcount,
    pendingTimesheets,
    upcomingBirthdays,
    upcomingEvents
  };
};

const getManagerStats = async (managerId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const teamMembers = await User.find({ reportingManager: managerId, isActive: true }).select('_id firstname lastname');
  const teamIds = teamMembers.map(m => m._id);

  const [pendingLeaves, teamOnLeave, pendingTimesheets, teamAttendance] = await Promise.all([
    LeaveRequest.countDocuments({ reportingManagerId: managerId, leaveStatus: 'PENDING' }),
    LeaveRequest.countDocuments({ userId: { $in: teamIds }, leaveStatus: 'APPROVED', leaveStartDate: { $lte: today }, leaveEndDate: { $gte: today } }),
    Timesheet.countDocuments({ userId: { $in: teamIds }, status: 'PENDING' }),
    Attendance.find({ userId: { $in: teamIds }, date: { $gte: today, $lt: tomorrow } }).populate('userId', 'firstname lastname')
  ]);

  // Also get manager's own employee data
  const myStats = await getEmployeeStats(managerId);

  const upcomingEvents = await eventService.getUpcomingEvents(7);

  return {
    teamSize: teamMembers.length,
    teamMembers: teamMembers.map(m => ({ id: m._id, name: `${m.firstname} ${m.lastname}` })),
    pendingLeaves, teamOnLeave, pendingTimesheets,
    teamAttendanceToday: teamAttendance,
    upcomingEvents,
    ...myStats
  };
};

const getEmployeeStats = async (userId) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const [leaveBalance, recentLeaves, attendanceThisMonth, latestPayroll] = await Promise.all([
    LeaveBalance.find({ userId, year }),
    LeaveRequest.find({ userId }).sort({ createdDate: -1 }).limit(5),
    Attendance.find({ userId, date: { $gte: firstOfMonth, $lte: lastOfMonth } }),
    Payroll.findOne({ userId }).sort({ year: -1, month: -1 })
  ]);

  const attendanceSummary = {
    present: attendanceThisMonth.filter(a => a.status === 'PRESENT').length,
    absent: attendanceThisMonth.filter(a => a.status === 'ABSENT').length,
    wfh: attendanceThisMonth.filter(a => a.status === 'WFH').length,
    halfDay: attendanceThisMonth.filter(a => a.status === 'HALF_DAY').length,
    onLeave: attendanceThisMonth.filter(a => a.status === 'ON_LEAVE').length,
  };

  return {
    leaveBalance,
    recentLeaves,
    attendanceSummary,
    latestPayroll: latestPayroll ? {
      month: latestPayroll.month,
      year: latestPayroll.year,
      netSalary: latestPayroll.netSalary,
      status: latestPayroll.status
    } : null,
    upcomingEvents: await eventService.getUpcomingEvents(7)
  };
};

module.exports = { getAdminStats, getManagerStats, getEmployeeStats };
