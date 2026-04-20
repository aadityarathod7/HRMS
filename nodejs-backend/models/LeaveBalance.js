const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType:    { type: String, enum: ['CASUAL', 'SICK', 'PRIVILEGE', 'COMP_OFF', 'MATERNITY', 'PATERNITY'], required: true },
  totalAllotted:{ type: Number, default: 0 },   // max for the year
  accrued:      { type: Number, default: 0 },   // earned so far this year
  used:         { type: Number, default: 0 },   // days taken
  available:    { type: Number, default: 0 },   // accrued - used (carry-forward within year)
  year:         { type: Number, required: true },
  lastAccruedMonth: { type: Number, default: 0 } // 1-12, tracks last month accrual ran
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

leaveBalanceSchema.index({ userId: 1, leaveType: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
