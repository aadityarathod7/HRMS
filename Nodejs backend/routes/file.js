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
