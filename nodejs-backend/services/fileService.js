const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const UploadedFile = require('../models/UploadedFile');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const saveFiles = async (files, uploadedBy, userId) => {
  const savedFiles = [];
  for (const file of files) {
    const record = new UploadedFile({
      uploadedBy,
      userId,
      fileName: file.filename || file.originalname,
      fileType: file.mimetype,
      fileSize: file.size
    });
    await record.save();
    savedFiles.push(record);
  }
  return savedFiles;
};

const getFileContent = async (fileId) => {
  const fileRecord = await UploadedFile.findById(fileId);
  if (!fileRecord) throw { status: 404, message: 'File not found' };

  const filePath = path.join(UPLOAD_DIR, fileRecord.fileName);
  if (!fs.existsSync(filePath)) {
    throw { status: 404, message: 'File not found on disk' };
  }

  if (fileRecord.fileType === 'text/csv' || fileRecord.fileType === 'application/vnd.ms-excel') {
    return extractTextFromCSV(filePath);
  }

  return fs.readFileSync(filePath, 'utf-8');
};

const extractTextFromCSV = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true });
  return records.map(row => Object.values(row).join(', ')).join('\n');
};

const updateFileContent = async (fileId, newContent) => {
  const fileRecord = await UploadedFile.findById(fileId);
  if (!fileRecord) throw { status: 404, message: 'File not found' };

  const filePath = path.join(UPLOAD_DIR, fileRecord.fileName);
  fs.writeFileSync(filePath, newContent, 'utf-8');
  return 'File updated successfully';
};

const getFilteredFiles = async (query) => {
  const { fileName, uploadedBy, startDate, endDate, userId, page = 0, size = 10, sortBy = 'createdDate', sortDir = 'desc' } = query;

  const filter = {};
  if (userId) filter.userId = userId;
  if (fileName) filter.fileName = { $regex: fileName, $options: 'i' };
  if (uploadedBy) filter.uploadedBy = { $regex: uploadedBy, $options: 'i' };
  if (startDate || endDate) {
    filter.createdDate = {};
    if (startDate) filter.createdDate.$gte = new Date(startDate);
    if (endDate) filter.createdDate.$lte = new Date(endDate);
  }

  const sortField = sortBy === 'id' ? '_id' : sortBy;
  const sort = { [sortField]: sortDir === 'asc' ? 1 : -1 };
  const skip = page * size;

  const [content, totalElements] = await Promise.all([
    UploadedFile.find(filter).populate('userId', 'firstname lastname employeeId').populate('reviewedBy', 'firstname lastname').sort(sort).skip(skip).limit(size),
    UploadedFile.countDocuments(filter)
  ]);

  return {
    content,
    totalElements,
    totalPages: Math.ceil(totalElements / size),
    number: page,
    size
  };
};

const deleteFileById = async (id) => {
  const fileRecord = await UploadedFile.findById(id);
  if (!fileRecord) throw { status: 404, message: 'File not found' };

  const filePath = path.join(UPLOAD_DIR, fileRecord.fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await UploadedFile.findByIdAndDelete(id);
  return 'File deleted successfully';
};

module.exports = {
  saveFiles,
  getFileContent,
  updateFileContent,
  getFilteredFiles,
  deleteFileById
};
