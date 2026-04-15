const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },
  description: { type: String },
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedBy: { type: String },
  updatedDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Role', roleSchema);
