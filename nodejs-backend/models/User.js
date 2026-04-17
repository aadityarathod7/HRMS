const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String },
  lastname: { type: String },
  email: { type: String },
  contactNumber: { type: String },
  dob: { type: Date },
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
  bloodGroup: { type: String },
  address: { type: String },

  // Organization
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  branch: { type: String },
  employmentType: { type: String, enum: ['FULLTIME', 'PARTTIME', 'CONTRACT'], default: 'FULLTIME' },
  dateOfJoining: { type: Date },
  noticePeriod: { type: Number, default: 90 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'PROBATION', 'NOTICE_PERIOD'], default: 'PROBATION' },
  isActive: { type: Boolean, default: true },

  // Compensation
  ctc: { type: Number },

  // Bank details
  bankAccountNumber: { type: String },
  bankName: { type: String },
  ifscCode: { type: String },

  // ID documents
  panNumber: { type: String },
  aadharNumber: { type: String },

  // Emergency
  emergencyContactName: { type: String },
  emergencyContactNumber: { type: String },

  // Profile
  profilePicture: { type: String },

  // Roles
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],

  // Audit
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedBy: { type: String },
  updatedDate: { type: Date }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('User', userSchema);
