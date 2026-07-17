const express = require('express');
const router = express.Router();
const { Client, Proposal, Project, Employee, User } = require('../models');
const { protect } = require('../middleware/auth');

// =========================================================================
// Clients Endpoints
// =========================================================================

// @desc    Get all clients with linked projects count
// @route   GET /api/crm/clients
// @access  Private
router.get('/clients', protect, async (req, res) => {
  try {
    const clients = await Client.findAll({
      order: [['companyName', 'ASC']]
    });

    const clientsWithCount = await Promise.all(
      clients.map(async (client) => {
        // Query linked projects matching companyName
        const projectsCount = await Project.count({
          where: { clientName: client.companyName }
        });

        return {
          ...client.toJSON(),
          projectsCount
        };
      })
    );

    res.json({ success: true, data: clientsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single client detail (proposals, projects, logs)
// @route   GET /api/crm/clients/:id
// @access  Private
router.get('/clients/:id', protect, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Fetch client proposals
    const proposals = await Proposal.findAll({
      where: { clientId: client.id },
      include: [{ model: Employee, as: 'creator', include: [{ model: User, as: 'user', attributes: ['name'] }] }],
      order: [['id', 'DESC']]
    });

    // Fetch active/past projects matching companyName
    const projects = await Project.findAll({
      where: { clientName: client.companyName },
      order: [['startDate', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        client,
        proposals,
        projects
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create client
// @route   POST /api/crm/clients
// @access  Private
router.post('/clients', protect, async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update client
// @route   PUT /api/crm/clients/:id
// @access  Private
router.put('/clients/:id', protect, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    await client.update(req.body);
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete client
// @route   DELETE /api/crm/clients/:id
// @access  Private
router.delete('/clients/:id', protect, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    await client.destroy();
    res.json({ success: true, message: 'Client removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// Proposals Endpoints
// =========================================================================

// @desc    Get all proposals
// @route   GET /api/crm/proposals
// @access  Private
router.get('/proposals', protect, async (req, res) => {
  try {
    const proposals = await Proposal.findAll({
      include: [
        { model: Client, as: 'client', attributes: ['id', 'companyName'] },
        { model: Employee, as: 'creator', include: [{ model: User, as: 'user', attributes: ['name'] }] }
      ],
      order: [['id', 'DESC']]
    });
    res.json({ success: true, data: proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get proposal pipeline groupings (Kanban)
// @route   GET /api/crm/pipeline
// @access  Private
router.get('/pipeline', protect, async (req, res) => {
  try {
    const proposals = await Proposal.findAll({
      include: [
        { model: Client, as: 'client', attributes: ['id', 'companyName', 'industry'] }
      ]
    });

    const pipeline = {
      Draft: [],
      Sent: [],
      Negotiation: [],
      Won: [],
      Lost: []
    };

    let totalValue = 0;
    let wonValue = 0;
    let wonCount = 0;
    let closedCount = 0;

    proposals.forEach(p => {
      const val = parseFloat(p.estimatedValue || 0);
      totalValue += val;

      if (p.status === 'Won') {
        wonValue += val;
        wonCount++;
        closedCount++;
      } else if (p.status === 'Lost') {
        closedCount++;
      }

      if (pipeline[p.status]) {
        pipeline[p.status].push(p);
      } else {
        pipeline.Draft.push(p);
      }
    });

    const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

    res.json({
      success: true,
      data: {
        pipeline,
        totalValue,
        winRate,
        wonValue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create proposal
// @route   POST /api/crm/proposals
// @access  Private
router.post('/proposals', protect, async (req, res) => {
  try {
    // Inject current user employee ID as creator
    const employee = await Employee.findOne({ where: { userId: req.user.id } });
    const createdById = employee ? employee.id : 1;

    const proposal = await Proposal.create({
      ...req.body,
      createdById
    });

    const fullProposal = await Proposal.findByPk(proposal.id, {
      include: [{ model: Client, as: 'client', attributes: ['companyName'] }]
    });

    res.status(201).json({ success: true, data: fullProposal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update proposal
// @route   PUT /api/crm/proposals/:id
// @access  Private
router.put('/proposals/:id', protect, async (req, res) => {
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

// @desc    Delete proposal
// @route   DELETE /api/crm/proposals/:id
// @access  Private
router.delete('/proposals/:id', protect, async (req, res) => {
  try {
    const proposal = await Proposal.findByPk(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }
    await proposal.destroy();
    res.json({ success: true, message: 'Proposal removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
