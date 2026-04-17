const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const UploadedFile = require('../models/UploadedFile');

// Use memory storage — store file buffer in MongoDB (no disk needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Upload — any authenticated user
router.post('/upload', authenticate, upload.array('files'), async (req, res, next) => {
  try {
    const uploadedBy = req.user.userName;
    const userId = req.user.id;
    const documentNames = req.body.documentNames
      ? (Array.isArray(req.body.documentNames) ? req.body.documentNames : [req.body.documentNames])
      : [];

    const savedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const record = new UploadedFile({
        uploadedBy,
        userId,
        fileName: file.originalname,
        documentName: documentNames[i] || file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        fileData: file.buffer,
        status: 'PENDING'
      });
      await record.save();
      savedFiles.push({ id: record._id, fileName: record.fileName, documentName: record.documentName, fileSize: record.fileSize });
    }
    res.status(201).json(savedFiles);
  } catch (error) { next(error); }
});

// Get files — HR/Admin see all, employees see only their own
router.get('/filter', authenticate, async (req, res, next) => {
  try {
    const isAdminOrHR = req.user.roles.some(r => ['ADMIN', 'HR'].includes(r));
    const { fileName, startDate, endDate, userId: queryUserId, page = 0, size = 10 } = req.query;

    const filter = {};
    if (!isAdminOrHR) filter.userId = req.user.id;
    else if (queryUserId) filter.userId = queryUserId;
    if (fileName) filter.$or = [
      { fileName: { $regex: fileName, $options: 'i' } },
      { documentName: { $regex: fileName, $options: 'i' } }
    ];
    if (startDate || endDate) {
      filter.createdDate = {};
      if (startDate) filter.createdDate.$gte = new Date(startDate);
      if (endDate) filter.createdDate.$lte = new Date(endDate);
    }

    const skip = parseInt(page) * parseInt(size);
    const [content, totalElements] = await Promise.all([
      UploadedFile.find(filter)
        .select('-fileData') // Don't send binary data in list
        .populate('userId', 'firstname lastname employeeId')
        .populate('reviewedBy', 'firstname lastname')
        .sort({ createdDate: -1 })
        .skip(skip).limit(parseInt(size)),
      UploadedFile.countDocuments(filter)
    ]);

    res.json({ content, totalElements, totalPages: Math.ceil(totalElements / parseInt(size)), number: parseInt(page), size: parseInt(size) });
  } catch (error) { next(error); }
});

// Download file by id (supports token as query param for browser links)
router.get('/download/:id', async (req, res, next) => {
  if (req.query.token && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  return authenticate(req, res, async () => {
  try {
    const file = await UploadedFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (!file.fileData) return res.status(404).json({ message: 'File data not found' });

    res.setHeader('Content-Type', file.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.send(file.fileData);
  } catch (error) { next(error); }
  });
});

// Get file content (text files)
router.get('/get-file-content/:id', authenticate, async (req, res, next) => {
  try {
    const file = await UploadedFile.findById(req.params.id);
    if (!file || !file.fileData) return res.status(404).json({ message: 'File not found' });
    const content = file.fileData.toString('utf-8');
    res.json({ content });
  } catch (error) { next(error); }
});

// Approve — HR/Admin only
router.put('/approve/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const file = await UploadedFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    file.status = 'APPROVED';
    file.reviewedBy = req.user.id;
    file.reviewedAt = new Date();
    file.rejectionReason = undefined;
    await file.save();
    res.json({ id: file._id, status: file.status });
  } catch (error) { next(error); }
});

// Reject — HR/Admin only
router.put('/reject/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const file = await UploadedFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    file.status = 'REJECTED';
    file.reviewedBy = req.user.id;
    file.reviewedAt = new Date();
    file.rejectionReason = req.body.reason || 'Rejected by HR';
    await file.save();
    res.json({ id: file._id, status: file.status });
  } catch (error) { next(error); }
});

// Delete
router.delete('/delete/:id', authenticate, async (req, res, next) => {
  try {
    const file = await UploadedFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    const isAdminOrHR = req.user.roles.some(r => ['ADMIN', 'HR'].includes(r));
    if (!isAdminOrHR && file.userId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await UploadedFile.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) { next(error); }
});

module.exports = router;
