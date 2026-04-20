const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },

  // Earnings
  basicSalary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  da: { type: Number, default: 0 },
  ta: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  grossSalary: { type: Number, default: 0 },

  // Deductions
  pfEmployee: { type: Number, default: 0 },
  pfEmployer: { type: Number, default: 0 },
  professionalTax: { type: Number, default: 0 },
  tds: { type: Number, default: 0 },
  lopDays: { type: Number, default: 0 },
  lopDeduction: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },

  // Net
  netSalary: { type: Number, required: true },
  ctc: { type: Number, default: 0 },

  // Status
  status: { type: String, enum: ['PENDING', 'PROCESSED', 'PAID'], default: 'PENDING' },
  paidDate: { type: Date },
  payslipPath: { type: String },

  // Audit
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-calculate gross, deductions, net
payrollSchema.pre('save', function () {
  this.grossSalary = (this.basicSalary || 0) + (this.hra || 0) + (this.da || 0) + (this.ta || 0) + (this.specialAllowance || 0);
  this.totalDeductions = (this.pfEmployee || 0) + (this.professionalTax || 0) + (this.tds || 0) + (this.lopDeduction || 0);
  this.netSalary = this.grossSalary - this.totalDeductions;
});

payrollSchema.index({ userId: 1, year: -1, month: 1 });
payrollSchema.index({ status: 1 });

module.exports = mongoose.model('Payroll', payrollSchema);
