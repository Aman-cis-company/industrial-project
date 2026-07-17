const express = require('express');
const router = express.Router();
const { Milestone, Project, Employee } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get milestones (optionally filter by projectId)
// @route   GET /api/milestones
// @access  Private
router.get('/', protect, async (req, res) => {
  const { projectId } = req.query;
  const where = {};
  if (projectId) where.projectId = projectId;

  try {
    const milestones = await Milestone.findAll({
      where,
      include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'clientName'] }],
      order: [['targetDate', 'ASC']]
    });
    res.json({ success: true, data: milestones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create milestone (PM or Admin only)
// @route   POST /api/milestones
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Role check
    const userEmployee = await Employee.findOne({ where: { userId: req.user.id } });
    const isAssignedPM = userEmployee && project.projectManagerId === userEmployee.id;
    const isAdminOrDirector = req.user.role === 'Admin' || req.user.role === 'PMO Director';

    if (!isAdminOrDirector && !isAssignedPM) {
      return res.status(403).json({ success: false, message: 'Not authorized to create milestones for this project' });
    }

    const milestone = await Milestone.create(req.body);
    res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update milestone status
// @route   PUT /api/milestones/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    // Role check
    const userEmployee = await Employee.findOne({ where: { userId: req.user.id } });
    const isAssignedPM = userEmployee && milestone.project && milestone.project.projectManagerId === userEmployee.id;
    const isAdminOrDirector = req.user.role === 'Admin' || req.user.role === 'PMO Director';

    if (!isAdminOrDirector && !isAssignedPM) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this milestone' });
    }

    await milestone.update(req.body);
    res.json({ success: true, data: milestone });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    // Role check
    const userEmployee = await Employee.findOne({ where: { userId: req.user.id } });
    const isAssignedPM = userEmployee && milestone.project && milestone.project.projectManagerId === userEmployee.id;
    const isAdminOrDirector = req.user.role === 'Admin' || req.user.role === 'PMO Director';

    if (!isAdminOrDirector && !isAssignedPM) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this milestone' });
    }

    await milestone.destroy();
    res.json({ success: true, message: 'Milestone removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
