const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedBy: { type: String },
  updatedDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Department', departmentSchema);
