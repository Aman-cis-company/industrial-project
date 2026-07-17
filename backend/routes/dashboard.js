const express = require('express');
const router = express.Router();
const { Project, Task, Milestone, Employee, User, sequelize } = require('../models');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Total Active Projects (status !== Completed)
    const activeProjectsCount = await Project.count({
      where: {
        status: { [Op.ne]: 'Completed' }
      }
    });

    // 2. Projects by Status count
    const projects = await Project.findAll({
      attributes: ['status', 'budget', 'budgetSpent', 'serviceCategory']
    });

    const statusCounts = { OnTrack: 0, AtRisk: 0, Delayed: 0, Completed: 0 };
    let totalBudget = 0;
    let totalSpent = 0;
    const categoryCounts = {};

    projects.forEach(p => {
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      }
      totalBudget += parseFloat(p.budget || 0);
      totalSpent += parseFloat(p.budgetSpent || 0);

      // Category breakdown
      categoryCounts[p.serviceCategory] = (categoryCounts[p.serviceCategory] || 0) + 1;
    });

    // Convert category counts to array structure for donut chart
    const categoryBreakdown = Object.keys(categoryCounts).map(cat => ({
      name: cat,
      value: categoryCounts[cat]
    }));

    // 3. Overdue Tasks (dueDate < today and status !== Done)
    const overdueTasksCount = await Task.count({
      where: {
        dueDate: { [Op.lt]: today },
        status: { [Op.ne]: 'Done' }
      }
    });

    // 4. Upcoming Milestones (targetDate >= today and status === Upcoming)
    const upcomingMilestonesCount = await Milestone.count({
      where: {
        targetDate: { [Op.gte]: today },
        status: 'Upcoming'
      }
    });

    // 5. At-Risk/Delayed Projects details (max 5 for table)
    const atRiskProjects = await Project.findAll({
      where: {
        status: { [Op.in]: ['AtRisk', 'Delayed'] }
      },
      limit: 5,
      include: [
        {
          model: Employee,
          as: 'projectManager',
          attributes: ['id'],
          include: [{ model: User, as: 'user', attributes: ['name', 'avatarUrl'] }]
        }
      ]
    });

    // 6. Upcoming 5 milestones across all projects
    const upcomingMilestones = await Milestone.findAll({
      where: {
        status: 'Upcoming',
        targetDate: { [Op.gte]: today }
      },
      limit: 5,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ],
      order: [['targetDate', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        activeProjectsCount,
        statusCounts,
        totalBudget,
        totalSpent,
        overdueTasksCount,
        upcomingMilestonesCount,
        categoryBreakdown,
        atRiskProjects,
        upcomingMilestones
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get dashboard trends (Time-series data for charts)
// @route   GET /api/dashboard/trends
// @access  Private
router.get('/trends', protect, async (req, res) => {
  try {
    // Generate realistic budget burn trends representing contract growth in SAR
    const trends = [
      { month: 'Jan 2026', budgetBurn: 15400000.00, tasksCompleted: 10 },
      { month: 'Feb 2026', budgetBurn: 28900000.00, tasksCompleted: 22 },
      { month: 'Mar 2026', budgetBurn: 42100000.00, tasksCompleted: 35 },
      { month: 'Apr 2026', budgetBurn: 58400000.00, tasksCompleted: 48 },
      { month: 'May 2026', budgetBurn: 78900000.00, tasksCompleted: 64 },
      { month: 'Jun 2026', budgetBurn: 92300000.00, tasksCompleted: 80 },
      { month: 'Jul 2026', budgetBurn: 114500000.00, tasksCompleted: 98 } // Current Month lock
    ];

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
