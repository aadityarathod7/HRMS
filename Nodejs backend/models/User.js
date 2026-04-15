const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String },
  lastname: { type: String },
  dob: { type: Date },
  contactNumber: { type: String },
  branch: { type: String },
  bloodGroup: { type: String },
  dateOfJoining: { type: Date },
  isActive: { type: Boolean, default: true },
  address: { type: String },
  email: { type: String },
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedBy: { type: String },
  updatedDate: { type: Date }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('User', userSchema);
