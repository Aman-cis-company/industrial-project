const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Document, Project, Employee, User } = require('../models');
const { protect } = require('../middleware/auth');

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const projectId = req.body.projectId || 'general';
    const uploadPath = path.join(__dirname, '..', 'uploads', String(projectId));
    
    // Create folder structure if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// @desc    Get all documents (Latest versions only, with query filters)
// @route   GET /api/documents
// @access  Private
router.get('/', protect, async (req, res) => {
  const { projectId, discipline, fileType, search } = req.query;
  const where = {};
  if (projectId) where.projectId = projectId;
  if (discipline) where.discipline = discipline;
  if (fileType) where.fileType = fileType;

  try {
    const allDocs = await Document.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'clientName'] },
        { 
          model: Employee, 
          as: 'uploader', 
          attributes: ['id', 'designation'],
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
        }
      ],
      order: [['version', 'DESC'], ['id', 'DESC']]
    });

    // filter to latest version of each unique filename per project
    const latestMap = {};
    const filteredDocs = [];

    allDocs.forEach(doc => {
      const key = `${doc.projectId}_${doc.fileName.toLowerCase()}`;
      if (!latestMap[key]) {
        latestMap[key] = true;
        
        // Handle mock Smart Document Search over filename + description fields
        if (search) {
          const query = search.toLowerCase();
          const matchName = doc.fileName.toLowerCase().includes(query);
          const matchDesc = doc.description && doc.description.toLowerCase().includes(query);
          if (matchName || matchDesc) {
            filteredDocs.push(doc);
          }
        } else {
          filteredDocs.push(doc);
        }
      }
    });

    res.json({ success: true, data: filteredDocs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Upload document and handle version control
// @route   POST /api/documents
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { projectId, discipline, description } = req.body;
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is required' });
    }

    const originalName = req.file.originalname;
    const ext = path.extname(originalName).toLowerCase().replace('.', '');
    const userEmployee = await Employee.findOne({ where: { userId: req.user.id } });
    const uploadedById = userEmployee ? userEmployee.id : 1; // default fallback

    // Find the latest version of this document name inside the project
    const latestDoc = await Document.findOne({
      where: { projectId, fileName: originalName },
      order: [['version', 'DESC']]
    });

    const nextVersion = latestDoc ? latestDoc.version + 1 : 1;

    const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);
    const webFilePath = '/' + relativePath.replace(/\\/g, '/');

    // Create the document record
    const document = await Document.create({
      projectId,
      fileName: originalName,
      fileType: ext,
      filePath: webFilePath,
      version: nextVersion,
      uploadedById,
      discipline: discipline || 'General',
      description: description || '',
      fileSizeKB: Math.round(req.file.size / 1024)
    });

    const fullDoc = await Document.findByPk(document.id, {
      include: [
        { 
          model: Employee, 
          as: 'uploader', 
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        }
      ]
    });

    res.status(201).json({ success: true, data: fullDoc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Get document version history
// @route   GET /api/documents/:id/history
// @access  Private
router.get('/:id/history', protect, async (req, res) => {
  try {
    const currentDoc = await Document.findByPk(req.params.id);
    if (!currentDoc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Retrieve all files sharing same name and project
    const history = await Document.findAll({
      where: {
        projectId: currentDoc.projectId,
        fileName: currentDoc.fileName
      },
      include: [
        { 
          model: Employee, 
          as: 'uploader', 
          attributes: ['id', 'designation'],
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        }
      ],
      order: [['version', 'DESC']]
    });

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete document version
// @route   DELETE /api/documents/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document version not found' });
    }

    if (document.filePath && document.filePath !== '#') {
      const fullPath = path.join(__dirname, '..', document.filePath);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch (e) { console.error('File unlink error:', e); }
      }
    }

    await document.destroy();
    res.json({ success: true, message: 'Document version deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
