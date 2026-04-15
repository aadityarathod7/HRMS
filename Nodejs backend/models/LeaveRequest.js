const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportingManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveStartDate: { type: Date },
  leaveEndDate: { type: Date },
  leaveType: { type: String },
  description: { type: String },
  leaveStatus: { type: String, default: 'PENDING' },
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedBy: { type: String },
  updatedDate: { type: Date }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

leaveRequestSchema.pre('findOneAndUpdate', function () {
  this.set({ updatedDate: new Date() });
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
