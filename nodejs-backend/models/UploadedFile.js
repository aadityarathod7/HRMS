const mongoose = require('mongoose');

const uploadedFileSchema = new mongoose.Schema({
  uploadedBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  fileName: { type: String },
  fileType: { type: String },
  fileSize: { type: Number }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('UploadedFile', uploadedFileSchema);
