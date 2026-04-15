const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  hoursWorked: { type: Number, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  taskDescription: { type: String },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Timesheet', timesheetSchema);
