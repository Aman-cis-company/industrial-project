const express = require('express');
const router = express.Router();
const { ComplianceItem, Project } = require('../models');
const { protect } = require('../middleware/auth');

// @desc    Get all compliance items (with optional filters)
// @route   GET /api/compliance
// @access  Private
router.get('/', protect, async (req, res) => {
  const { projectId, status, applicableServiceCategory } = req.query;
  const where = {};
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (applicableServiceCategory) where.applicableServiceCategory = applicableServiceCategory;

  try {
    const items = await ComplianceItem.findAll({
      where,
      include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'clientName', 'serviceCategory'] }],
      order: [['dueDate', 'ASC'], ['id', 'DESC']]
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create compliance item
// @route   POST /api/compliance
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const item = await ComplianceItem.create(req.body);
    const fullItem = await ComplianceItem.findByPk(item.id, {
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
    });

    res.status(201).json({ success: true, data: fullItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update compliance item
// @route   PUT /api/compliance/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await ComplianceItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Compliance item not found' });
    }

    await item.update(req.body);
    const updatedItem = await ComplianceItem.findByPk(item.id, {
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
    });

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete compliance item
// @route   DELETE /api/compliance/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await ComplianceItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Compliance item not found' });
    }
    await item.destroy();
    res.json({ success: true, message: 'Compliance item removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
