const express = require('express');
const router = express.Router();
const { Proposal, User } = require('../models');
const { protect } = require('../middleware/auth');

// Get all proposals
router.get('/', protect, async (req, res) => {
  try {
    const proposals = await Proposal.findAll({
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'role'] }
      ]
    });
    res.json({ success: true, data: proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create proposal
router.post('/', protect, async (req, res) => {
  try {
    const proposalData = { ...req.body, createdById: req.user.id };
    const proposal = await Proposal.create(proposalData);
    res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update proposal
router.put('/:id', protect, async (req, res) => {
  try {
    const proposal = await Proposal.findByPk(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }
    await proposal.update(req.body);
    res.json({ success: true, data: proposal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
