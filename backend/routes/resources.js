const express = require('express');
const router = express.Router();
const { Employee, User, ProjectTeamMember, Project } = require('../models');
const { protect } = require('../middleware/auth');

// @desc    Get resources utilization and project allocations
// @route   GET /api/resources/utilization
// @access  Private
router.get('/utilization', protect, async (req, res) => {
  const { discipline, department } = req.query;

  try {
    const employeeFilter = {};
    if (discipline) employeeFilter.discipline = discipline;
    if (department) employeeFilter.department = department;

    const employees = await Employee.findAll({
      where: employeeFilter,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] },
        {
          model: ProjectTeamMember,
          as: 'projectAllocations',
          include: [{
            model: Project,
            as: 'project',
            attributes: ['id', 'name', 'status', 'startDate', 'endDate']
          }]
        }
      ]
    });

    const utilizationData = employees.map(emp => {
      let totalAllocation = 0;
      const activeAllocations = [];

      if (emp.projectAllocations) {
        emp.projectAllocations.forEach(alloc => {
          // Count only active (not completed) projects towards active workload
          if (alloc.project && alloc.project.status !== 'Completed') {
            totalAllocation += alloc.allocationPercent;
            activeAllocations.push({
              projectId: alloc.project.id,
              projectName: alloc.project.name,
              status: alloc.project.status,
              allocationPercent: alloc.allocationPercent,
              startDate: alloc.project.startDate,
              endDate: alloc.project.endDate
            });
          }
        });
      }

      let status = 'Healthy';
      if (totalAllocation < 40) {
        status = 'Underutilized';
      } else if (totalAllocation > 100) {
        status = 'Overallocated';
      } else if (totalAllocation >= 90) {
        status = 'NearCapacity';
      }

      return {
        id: emp.id,
        name: emp.user?.name || 'Technical Specialist',
        email: emp.user?.email || '',
        avatarUrl: emp.user?.avatarUrl,
        discipline: emp.discipline,
        department: emp.department,
        designation: emp.designation,
        totalAllocation,
        status,
        allocations: activeAllocations
      };
    });

    res.json({ success: true, data: utilizationData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
