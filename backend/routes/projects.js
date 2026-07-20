const express = require('express');
const router = express.Router();
const { Project, Employee, User, ProjectTeamMember, Task, Document, Risk, Approval, ComplianceItem, ApprovalWorkflow, ApprovalStep } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all projects with manager & team count
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: Employee,
          as: 'projectManager',
          attributes: ['id', 'designation', 'department'],
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl', 'email'] }]
        },
        {
          model: Employee,
          as: 'teamMembers',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single project details (Overview, Manager, Team, Tasks, Docs, Risks, Approvals)
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          as: 'projectManager',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl', 'email'] }]
        },
        {
          model: Task,
          as: 'tasks',
          include: [
            {
              model: Employee,
              as: 'assignee',
              attributes: ['id'],
              include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }]
            }
          ]
        },
        {
          model: Document,
          as: 'documents',
          include: [
            {
              model: Employee,
              as: 'uploader',
              attributes: ['id'],
              include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }]
            }
          ]
        },
        {
          model: Risk,
          as: 'risks',
          include: [
            {
              model: Employee,
              as: 'owner',
              include: [{ model: User, as: 'user', attributes: ['name', 'avatarUrl'] }]
            }
          ]
        },
        {
          model: ComplianceItem,
          as: 'complianceItems'
        },
        {
          model: ApprovalWorkflow,
          as: 'approvalWorkflows',
          include: [
            {
              model: ApprovalStep,
              as: 'steps',
              include: [{ model: User, as: 'approverUser', attributes: ['name', 'avatarUrl'] }]
            }
          ]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Fetch team members with their join details manually or through associations
    const teamMembers = await ProjectTeamMember.findAll({
      where: { projectId: project.id },
      include: [
        {
          model: Employee,
          as: 'employee',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }]
        }
      ]
    });

    res.json({
      success: true,
      data: {
        ...project.toJSON(),
        team: teamMembers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create project (Admin or PMO Director only)
// @route   POST /api/projects
// @access  Private/Admin
router.post('/', protect, authorize('Admin', 'PMO Director'), async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update project (Admin, PMO Director, or Assigned PM)
// @route   PUT /api/projects/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Auth check: Admin, PMO Director, or the assigned PM
    const isPM = project.projectManagerId === req.user.id; // user id comparison
    // Wait, projectManagerId refers to Employee ID, so let's get the user's Employee ID first!
    const userEmployee = await Employee.findOne({ where: { userId: req.user.id } });
    const isAssignedPM = userEmployee && project.projectManagerId === userEmployee.id;
    const isAdminOrDirector = req.user.role === 'Admin' || req.user.role === 'PMO Director';

    if (!isAdminOrDirector && !isAssignedPM) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    await project.update(req.body);
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete project (Admin or PMO Director only)
// @route   DELETE /api/projects/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin', 'PMO Director'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    await project.destroy();
    res.json({ success: true, message: 'Project removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// Team Assignment Routes
// -------------------------------------------------------------

// @desc    Get project team members
// @route   GET /api/projects/:id/team
// @access  Private
router.get('/:id/team', protect, async (req, res) => {
  try {
    const team = await ProjectTeamMember.findAll({
      where: { projectId: req.params.id },
      include: [
        {
          model: Employee,
          as: 'employee',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }]
        }
      ]
    });
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Assign or update employee on project
// @route   POST /api/projects/:id/team
// @access  Private
router.post('/:id/team', protect, async (req, res) => {
  try {
    const { employeeId, roleOnProject, allocationPercent } = req.body;
    const projectId = req.params.id;

    // Check project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Role check: Admin, PMO Director, or the assigned PM
    const userEmployee = await Employee.findOne({ where: { userId: req.user.id } });
    const isAssignedPM = userEmployee && project.projectManagerId === userEmployee.id;
    const isAdminOrDirector = req.user.role === 'Admin' || req.user.role === 'PMO Director';

    if (!isAdminOrDirector && !isAssignedPM) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this project team' });
    }

    // Check if employee is already assigned
    let member = await ProjectTeamMember.findOne({
      where: { projectId, employeeId }
    });

    if (member) {
      // Update
      await member.update({
        roleOnProject: roleOnProject || member.roleOnProject,
        allocationPercent: allocationPercent !== undefined ? allocationPercent : member.allocationPercent
      });
    } else {
      // Create
      member = await ProjectTeamMember.create({
        projectId,
        employeeId,
        roleOnProject: roleOnProject || 'Technical Contributor',
        allocationPercent: allocationPercent !== undefined ? allocationPercent : 100
      });
    }

    const fullMember = await ProjectTeamMember.findOne({
      where: { id: member.id },
      include: [
        {
          model: Employee,
          as: 'employee',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }]
        }
      ]
    });

    res.status(200).json({ success: true, data: fullMember });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Unassign employee from project
// @route   DELETE /api/projects/:id/team/:employeeId
// @access  Private
router.delete('/:id/team/:employeeId', protect, async (req, res) => {
  try {
    const projectId = req.params.id;
    const { employeeId } = req.params;

    // Check project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Role check
    const userEmployee = await Employee.findOne({ where: { userId: req.user.id } });
    const isAssignedPM = userEmployee && project.projectManagerId === userEmployee.id;
    const isAdminOrDirector = req.user.role === 'Admin' || req.user.role === 'PMO Director';

    if (!isAdminOrDirector && !isAssignedPM) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this project team' });
    }

    const member = await ProjectTeamMember.findOne({
      where: { projectId, employeeId }
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Employee is not assigned to this project' });
    }

    await member.destroy();
    res.json({ success: true, message: 'Employee unassigned from project successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
