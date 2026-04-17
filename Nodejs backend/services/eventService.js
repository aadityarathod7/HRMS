const Event = require('../models/Event');
const User = require('../models/User');

const createEvent = async (data) => {
  const event = new Event({ ...data, createdDate: new Date() });
  return await event.save();
};

const getAllEvents = async (month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  // Get custom events for this month
  const events = await Event.find({
    date: { $gte: start, $lte: end },
    status: { $ne: 'CANCELLED' }
  }).populate('createdBy', 'firstname lastname').populate('department', 'departmentName').sort({ date: 1 });

  // Generate birthdays for this month
  const birthdays = await generateBirthdays(month);

  // Generate work anniversaries for this month
  const anniversaries = await generateAnniversaries(month);

  return [...events, ...birthdays, ...anniversaries].sort((a, b) => new Date(a.date) - new Date(b.date));
};

const getUpcomingEvents = async (days = 7) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const future = new Date(today);
  future.setDate(future.getDate() + days);

  const events = await Event.find({
    date: { $gte: today, $lte: future },
    status: { $ne: 'CANCELLED' }
  }).populate('createdBy', 'firstname lastname').sort({ date: 1 });

  const birthdays = await generateBirthdays(today.getMonth() + 1);
  const anniversaries = await generateAnniversaries(today.getMonth() + 1);

  const allEvents = [...events, ...birthdays, ...anniversaries]
    .filter(e => {
      const d = new Date(e.date);
      return d >= today && d <= future;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return allEvents;
};

const generateBirthdays = async (month) => {
  const users = await User.find({ isActive: true, dob: { $exists: true, $ne: null } }).select('firstname lastname dob department');
  const currentYear = new Date().getFullYear();

  return users
    .filter(u => {
      const d = new Date(u.dob);
      return d.getMonth() + 1 === parseInt(month);
    })
    .map(u => {
      const bday = new Date(u.dob);
      bday.setFullYear(currentYear);
      return {
        id: `bday-${u._id}`,
        title: `${u.firstname} ${u.lastname}'s Birthday`,
        eventType: 'BIRTHDAY',
        date: bday,
        isAllDay: true,
        isRecurring: true,
        status: 'UPCOMING',
        _generated: true
      };
    });
};

const generateAnniversaries = async (month) => {
  const users = await User.find({ isActive: true, dateOfJoining: { $exists: true, $ne: null } }).select('firstname lastname dateOfJoining');
  const currentYear = new Date().getFullYear();

  return users
    .filter(u => {
      const d = new Date(u.dateOfJoining);
      return d.getMonth() + 1 === parseInt(month) && d.getFullYear() < currentYear;
    })
    .map(u => {
      const joinDate = new Date(u.dateOfJoining);
      const years = currentYear - joinDate.getFullYear();
      const annivDate = new Date(joinDate);
      annivDate.setFullYear(currentYear);
      return {
        id: `anniv-${u._id}`,
        title: `${u.firstname} ${u.lastname}'s ${years}-Year Work Anniversary`,
        eventType: 'WORK_ANNIVERSARY',
        date: annivDate,
        isAllDay: true,
        isRecurring: true,
        status: 'UPCOMING',
        _generated: true
      };
    });
};

const getHolidays = async (year) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);
  return await Event.find({ eventType: 'HOLIDAY', date: { $gte: start, $lte: end } }).sort({ date: 1 });
};

const getEventById = async (id) => {
  const event = await Event.findById(id).populate('createdBy', 'firstname lastname').populate('department', 'departmentName').populate('participants', 'firstname lastname');
  if (!event) throw { status: 404, message: 'Event not found' };
  return event;
};

const updateEvent = async (id, data) => {
  const event = await Event.findById(id);
  if (!event) throw { status: 404, message: 'Event not found' };
  ['title', 'description', 'eventType', 'date', 'endDate', 'time', 'location', 'isAllDay', 'department', 'participants', 'status'].forEach(f => {
    if (data[f] !== undefined) event[f] = data[f];
  });
  event.updatedDate = new Date();
  return await event.save();
};

const deleteEvent = async (id) => {
  const result = await Event.findByIdAndDelete(id);
  if (!result) throw { status: 404, message: 'Event not found' };
};

module.exports = { createEvent, getAllEvents, getUpcomingEvents, generateBirthdays, generateAnniversaries, getHolidays, getEventById, updateEvent, deleteEvent };
