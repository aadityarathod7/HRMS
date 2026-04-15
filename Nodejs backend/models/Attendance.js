const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkIn: { type: String },
  checkOut: { type: String },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE'], default: 'PRESENT' },
  notes: { type: String },
  createdDate: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
