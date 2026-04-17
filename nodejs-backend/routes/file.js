const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fileService = require('../services/fileService');
const { authenticate, authorize } = require('../middleware/auth');
const UploadedFile = require('../models/UploadedFile');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, path.join(__dirname, '..', 'uploads')); },
  filename: (req, file, cb) => { cb(null, `${Date.now()}-${file.originalname}`); }
});
const upload = multer({ storage });

// Upload — any authenticated user can upload their own documents
router.post('/upload', authenticate, upload.array('files'), async (req, res, next) => {
  try {
    const uploadedBy = req.user.userName;
    const userId = req.user.id;
    const result = await fileService.saveFiles(req.files, uploadedBy, userId);
    res.status(201).json(result);
  } catch (error) { next(error); }
});

// Get files — HR/Admin see all, employees see only their own
router.get('/filter', authenticate, async (req, res, next) => {
  try {
    const isAdminOrHR = req.user.roles.some(r => ['ADMIN', 'HR'].includes(r));
    const query = isAdminOrHR ? req.query : { ...req.query, userId: req.user.id };
    res.json(await fileService.getFilteredFiles(query));
  } catch (error) { next(error); }
});

// Get my files
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const files = await UploadedFile.find({ userId: req.user.id })
      .populate('reviewedBy', 'firstname lastname')
      .sort({ createdDate: -1 });
    res.json(files);
  } catch (error) { next(error); }
});

// Approve document — HR/Admin only
router.put('/approve/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const file = await UploadedFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    file.status = 'APPROVED';
    file.reviewedBy = req.user.id;
    file.reviewedAt = new Date();
    file.rejectionReason = undefined;
    await file.save();
    res.json(file);
  } catch (error) { next(error); }
});

// Reject document — HR/Admin only
router.put('/reject/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const file = await UploadedFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    file.status = 'REJECTED';
    file.reviewedBy = req.user.id;
    file.reviewedAt = new Date();
    file.rejectionReason = req.body.reason || 'Rejected by HR';
    await file.save();
    res.json(file);
  } catch (error) { next(error); }
});

router.get('/get-file-content/:id', authenticate, async (req, res, next) => {
  try { res.json({ content: await fileService.getFileContent(req.params.id) }); }
  catch (error) { next(error); }
});

// Download
router.get('/download/:id', async (req, res, next) => {
  if (req.query.token && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  return authenticate(req, res, async () => {
    try {
      const fileRecord = await UploadedFile.findById(req.params.id);
      if (!fileRecord) return res.status(404).json({ message: 'File not found' });
      const filePath = path.join(__dirname, '..', 'uploads', fileRecord.fileName);
      const fs = require('fs');
      if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on disk' });
      res.setHeader('Content-Type', fileRecord.fileType);
      res.setHeader('Content-Disposition', `inline; filename="${fileRecord.fileName}"`);
      fs.createReadStream(filePath).pipe(res);
    } catch (error) { next(error); }
  });
});

router.put('/update/:fileId', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.json({ message: await fileService.updateFileContent(req.params.fileId, req.body.newContent) }); }
  catch (error) { next(error); }
});

router.delete('/delete/:id', authenticate, async (req, res, next) => {
  try {
    const file = await UploadedFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    // Only owner or HR/Admin can delete
    const isAdminOrHR = req.user.roles.some(r => ['ADMIN', 'HR'].includes(r));
    if (!isAdminOrHR && file.userId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ message: await fileService.deleteFileById(req.params.id) });
  } catch (error) { next(error); }
});

module.exports = router;
