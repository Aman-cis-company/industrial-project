const express = require('express');
const router = express.Router();
const { Project, Task, Risk } = require('../models');
const aiService = require('../services/aiService');
const { protect } = require('../middleware/auth');

// @desc    Generate executive summary for a project
// @route   POST /api/ai/executive-summary/:projectId
// @access  Private
router.post('/executive-summary/:projectId', protect, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId, {
      include: [
        { model: Task, as: 'tasks' },
        { model: Risk, as: 'risks' }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const summary = await aiService.generateProjectSummary(project);
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Process natural language semantic query against DB tables
// @route   POST /api/ai/query
// @access  Private
router.post('/query', protect, async (req, res) => {
  const { queryText } = req.body;

  if (!queryText || !queryText.trim()) {
    return res.status(400).json({ success: false, message: 'Please provide queryText in request body' });
  }

  try {
    const result = await aiService.processNaturalLanguageQuery(queryText);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Draft proposal outlines
// @route   POST /api/ai/proposal-draft
// @access  Private
router.post('/proposal-draft', protect, async (req, res) => {
  const { clientName, serviceCategory } = req.body;

  if (!clientName || !serviceCategory) {
    return res.status(400).json({ success: false, message: 'Please provide clientName and serviceCategory' });
  }

  try {
    const outline = await aiService.generateProposalOutline(clientName, serviceCategory);
    res.json({ success: true, outline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
