const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PROCESSED', 'PAID'], default: 'PENDING' },
  paidDate: { type: Date },
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Payroll', payrollSchema);
