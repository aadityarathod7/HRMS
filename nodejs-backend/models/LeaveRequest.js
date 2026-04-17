const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportingManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveStartDate: { type: Date },
  leaveEndDate: { type: Date },
  leaveType: { type: String, enum: ['CASUAL', 'SICK', 'PRIVILEGE', 'COMP_OFF', 'MATERNITY', 'PATERNITY', 'LOP'] },
  numberOfDays: { type: Number },
  halfDay: { type: Boolean, default: false },
  halfDayType: { type: String, enum: ['FIRST_HALF', 'SECOND_HALF', ''], default: '' },
  description: { type: String },
  leaveStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalDate: { type: Date },
  rejectionReason: { type: String },
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedBy: { type: String },
  updatedDate: { type: Date }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

leaveRequestSchema.pre('save', function () {
  if (this.leaveStartDate && this.leaveEndDate) {
    const diffTime = Math.abs(this.leaveEndDate - this.leaveStartDate);
    this.numberOfDays = this.halfDay ? 0.5 : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
