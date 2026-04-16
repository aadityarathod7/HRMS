const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: { type: String, unique: true },
  name: { type: String },
  description: { type: String },
  clientName: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  budget: { type: Number },
  priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
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
