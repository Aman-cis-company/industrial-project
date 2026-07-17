const express = require('express');
const router = express.Router();
const { Risk, Project, Employee, User } = require('../models');
const { protect } = require('../middleware/auth');

// @desc    Get all risks (with optional projectId filter)
// @route   GET /api/risks
// @access  Private
router.get('/', protect, async (req, res) => {
  const { projectId, category, status } = req.query;
  const where = {};
  if (projectId) where.projectId = projectId;
  if (category) where.category = category;
  if (status) where.status = status;

  try {
    const risks = await Risk.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'clientName', 'serviceCategory'] },
        {
          model: Employee,
          as: 'owner',
          attributes: ['id', 'designation'],
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }]
        }
      ],
      order: [['riskScore', 'DESC'], ['id', 'DESC']]
    });
    res.json({ success: true, data: risks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create risk
// @route   POST /api/risks
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { projectId, probability, impact } = req.body;
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Auto calculate risk score
    const riskScore = Number(probability || 3) * Number(impact || 3);

    const risk = await Risk.create({
      ...req.body,
      riskScore
    });

    const fullRisk = await Risk.findByPk(risk.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        {
          model: Employee,
          as: 'owner',
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        }
      ]
    });

    res.status(201).json({ success: true, data: fullRisk });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update risk
// @route   PUT /api/risks/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const risk = await Risk.findByPk(req.params.id);
    if (!risk) {
      return res.status(404).json({ success: false, message: 'Risk not found' });
    }

    // Re-calculate risk score if probability or impact changed
    const probability = req.body.probability !== undefined ? req.body.probability : risk.probability;
    const impact = req.body.impact !== undefined ? req.body.impact : risk.impact;
    const riskScore = Number(probability) * Number(impact);

    await risk.update({
      ...req.body,
      riskScore
    });

    const updatedRisk = await Risk.findByPk(risk.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        {
          model: Employee,
          as: 'owner',
          include: [{ model: User, as: 'user', attributes: ['name', 'avatarUrl'] }]
        }
      ]
    });

    res.json({ success: true, data: updatedRisk });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete risk
// @route   DELETE /api/risks/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const risk = await Risk.findByPk(req.params.id);
    if (!risk) {
      return res.status(404).json({ success: false, message: 'Risk not found' });
    }
    await risk.destroy();
    res.json({ success: true, message: 'Risk removed successfully' });
  } catch (error) {
    res.status(550).json({ success: false, message: error.message });
  }
});

module.exports = router;
