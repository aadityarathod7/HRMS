const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: { type: String, unique: true },
  name: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String },
  teamMembers: { type: String },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'ONHOLD', 'INACTIVE'], default: 'ACTIVE' },
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedBy: { type: String },
  updatedDate: { type: Date }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Project', projectSchema);
