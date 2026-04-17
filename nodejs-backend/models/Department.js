const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentCode: { type: String, unique: true },
  departmentName: { type: String, required: true },
  description: { type: String },
  contactPerson: { type: String, required: true },
  headOfDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedBy: { type: String },
  updatedDate: { type: Date }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Department', departmentSchema);
