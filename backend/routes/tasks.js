const express = require('express');
const router = express.Router();
const { Task, Project, Employee, User } = require('../models');
const { protect } = require('../middleware/auth');

// @desc    Get currently logged-in employee's tasks ("My Tasks")
// @route   GET /api/tasks/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { userId: req.user.id } });
    if (!employee) {
      // Admins or Clients without employee profile see empty tasks list
      return res.json({ success: true, data: [] });
    }

    const tasks = await Task.findAll({
      where: { assigneeId: employee.id },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'clientName', 'serviceCategory'] }
      ]
    });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all tasks with optional filters
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  const { projectId, assigneeId, status, priority, phase } = req.query;
  const where = {};
  if (projectId) where.projectId = projectId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (phase) where.phase = phase;

  try {
    const tasks = await Task.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'clientName'] },
        { 
          model: Employee, 
          as: 'assignee', 
          attributes: ['id', 'designation'],
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }]
        }
      ]
    });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Role check: Admin, PMO Director, or Project Manager of this project
    const userEmployee = await Employee.findOne({ where: { userId: req.user.id } });
    const isAssignedPM = userEmployee && project.projectManagerId === userEmployee.id;
    const isAdminOrDirector = req.user.role === 'Admin' || req.user.role === 'PMO Director';

    if (!isAdminOrDirector && !isAssignedPM) {
      return res.status(403).json({ success: false, message: 'Not authorized to create tasks for this project' });
    }

    const task = await Task.create(req.body);
    
    const fullTask = await Task.findByPk(task.id, {
      include: [
        { 
          model: Employee, 
          as: 'assignee', 
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
        }
      ]
    });

    res.status(201).json({ success: true, data: fullTask });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update task details or status
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const userEmployee = await Employee.findOne({ where: { userId: req.user.id } });
    const isManager = userEmployee && task.project && task.project.projectManagerId === userEmployee.id;
    const isAssignee = userEmployee && task.assigneeId === userEmployee.id;
    const isAdminOrDirector = req.user.role === 'Admin' || req.user.role === 'PMO Director';

    if (!isAdminOrDirector && !isManager && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    if (req.body.priority !== undefined && !isAdminOrDirector) {
      return res.status(403).json({ success: false, message: 'Only Admin and PMO Director can change task priority' });
    }

    if (isAssignee && !isAdminOrDirector && !isManager) {
      // Assignee can only update status
      const { status } = req.body;
      await task.update({ status });
    } else {
      // Managers and Admins can update everything
      await task.update(req.body);
    }

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { 
          model: Employee, 
          as: 'assignee', 
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }]
        }
      ]
    });

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const userEmployee = await Employee.findOne({ where: { userId: req.user.id } });
    const isManager = userEmployee && task.project && task.project.projectManagerId === userEmployee.id;
    const isAdminOrDirector = req.user.role === 'Admin' || req.user.role === 'PMO Director';

    if (!isAdminOrDirector && !isManager) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.destroy();
    res.json({ success: true, message: 'Task removed successfully' });
  } catch (error) {
    res.status(550).json({ success: false, message: error.message });
  }
});

module.exports = router;
