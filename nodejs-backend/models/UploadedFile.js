const mongoose = require('mongoose');

const uploadedFileSchema = new mongoose.Schema({
  uploadedBy: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdDate: { type: Date, default: Date.now },
  fileName: { type: String },
  fileType: { type: String },
  fileSize: { type: Number },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  rejectionReason: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('UploadedFile', uploadedFileSchema);
