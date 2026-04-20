const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkIn: { type: String },
  checkOut: { type: String },
  hoursWorked: { type: Number, default: 0 },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'WFH'], default: 'PRESENT' },
  location: { type: String, enum: ['OFFICE', 'WFH', 'HYBRID'], default: 'OFFICE' },
  overtimeHours: { type: Number, default: 0 },
  notes: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdDate: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-calculate hoursWorked from checkIn/checkOut
attendanceSchema.pre('save', function () {
  if (this.checkIn && this.checkOut) {
    const [inH, inM] = this.checkIn.split(':').map(Number);
    const [outH, outM] = this.checkOut.split(':').map(Number);
    let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // overnight shift support
    this.hoursWorked = Math.round((totalMinutes / 60) * 100) / 100;
    this.overtimeHours = this.hoursWorked > 9
      ? Math.round((this.hoursWorked - 9) * 100) / 100
      : 0;
  }
});

attendanceSchema.index({ userId: 1, date: -1 });
attendanceSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
