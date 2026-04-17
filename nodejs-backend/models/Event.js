const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  eventType: { type: String, enum: ['BIRTHDAY', 'HOLIDAY', 'COMPANY_EVENT', 'TEAM_EVENT', 'TRAINING', 'WORK_ANNIVERSARY'], required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  time: { type: String },
  location: { type: String },
  isAllDay: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  isRecurring: { type: Boolean, default: false },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'], default: 'UPCOMING' },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Event', eventSchema);
