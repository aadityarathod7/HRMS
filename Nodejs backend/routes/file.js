const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fileService = require('../services/fileService');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// POST /file/upload
router.post('/upload', upload.array('files'), async (req, res, next) => {
  try {
    const { uploadedBy } = req.body;
    const result = await fileService.saveFiles(req.files, uploadedBy);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /file/get-file-content/:id
router.get('/get-file-content/:id', async (req, res, next) => {
  try {
    const content = await fileService.getFileContent(req.params.id);
    res.json({ content });
  } catch (error) {
    next(error);
  }
});

// PUT /file/update/:fileId
router.put('/update/:fileId', async (req, res, next) => {
  try {
    const { newContent } = req.body;
    const result = await fileService.updateFileContent(req.params.fileId, newContent);
    res.json({ message: result });
  } catch (error) {
    next(error);
  }
});

// GET /file/filter
router.get('/filter', async (req, res, next) => {
  try {
    const result = await fileService.getFilteredFiles(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// DELETE /file/delete/:id
router.delete('/delete/:id', async (req, res, next) => {
  try {
    const result = await fileService.deleteFileById(req.params.id);
    res.json({ message: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
