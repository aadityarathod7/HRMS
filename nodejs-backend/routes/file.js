const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fileService = require('../services/fileService');
const { authenticate, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, path.join(__dirname, '..', 'uploads')); },
  filename: (req, file, cb) => { cb(null, file.originalname); }
});
const upload = multer({ storage });

router.post('/upload', authenticate, upload.array('files'), async (req, res, next) => {
  try { const { uploadedBy } = req.body; res.status(201).json(await fileService.saveFiles(req.files, uploadedBy)); }
  catch (error) { next(error); }
});

router.get('/get-file-content/:id', authenticate, async (req, res, next) => {
  try { res.json({ content: await fileService.getFileContent(req.params.id) }); }
  catch (error) { next(error); }
});

// Serve raw file for viewing/downloading (supports token as query param for iframe/img)
router.get('/download/:id', async (req, res, next) => {
  // Support token from query param for embedded viewers
  if (req.query.token && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  return authenticate(req, res, async () => {
  try {
    const UploadedFile = require('../models/UploadedFile');
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

router.get('/filter', authenticate, async (req, res, next) => {
  try { res.json(await fileService.getFilteredFiles(req.query)); }
  catch (error) { next(error); }
});

router.delete('/delete/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try { res.json({ message: await fileService.deleteFileById(req.params.id) }); }
  catch (error) { next(error); }
});

module.exports = router;
