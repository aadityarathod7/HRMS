const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: String, enum: ['CASUAL', 'SICK', 'PRIVILEGE', 'COMP_OFF', 'MATERNITY', 'PATERNITY'], required: true },
  totalAllotted: { type: Number, default: 0 },
  used: { type: Number, default: 0 },
  available: { type: Number, default: 0 },
  year: { type: Number, required: true }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

leaveBalanceSchema.index({ userId: 1, leaveType: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
