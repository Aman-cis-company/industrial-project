const express = require('express');
const router = express.Router();
const { Employee, User, sequelize } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all employees with filters
// @route   GET /api/employees
// @access  Private
router.get('/', protect, async (req, res) => {
  const { department, discipline, availability } = req.query;
  const where = {};
  if (department) where.department = department;
  if (discipline) where.discipline = discipline;
  if (availability) where.availabilityStatus = availability;

  try {
    const employees = await Employee.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'isActive', 'avatarUrl']
        },
        {
          model: Employee,
          as: 'reportingManager',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });
    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single employee by id
// @route   GET /api/employees/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'isActive', 'avatarUrl']
        },
        {
          model: Employee,
          as: 'reportingManager',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Employee,
          as: 'directReports',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'role']
            }
          ]
        }
      ]
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create Employee (Admin or PMO Director only)
// @route   POST /api/employees
// @access  Private/Admin
router.post('/', protect, authorize('Admin', 'PMO Director'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      discipline,
      designation,
      reportingManagerId,
      phone,
      joinDate,
      availabilityStatus,
      avatarUrl
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // 1. Create User
    const user = await User.create({
      name,
      email,
      password: password || 'password123', // default demo password
      role: role || 'Engineer',
      isActive: true,
      avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8488&color=fff`
    }, { transaction });

    // 2. Create Employee Profile
    const employee = await Employee.create({
      userId: user.id,
      department,
      discipline,
      designation,
      reportingManagerId: reportingManagerId || null,
      phone,
      joinDate: joinDate || new Date().toISOString().split('T')[0],
      availabilityStatus: availabilityStatus || 'Available'
    }, { transaction });

    await transaction.commit();

    const fullEmployee = await Employee.findByPk(employee.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } }
      ]
    });

    res.status(201).json({ success: true, data: fullEmployee });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update Employee (Admin, PMO Director, or self)
// @route   PUT /api/employees/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const user = await User.findByPk(employee.userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Linked user record not found' });
    }

    // Auth check: Admin, PMO Director, or the Employee themselves
    const isSelf = req.user.id === user.id;
    const isAdminOrDirector = req.user.role === 'Admin' || req.user.role === 'PMO Director';

    if (!isAdminOrDirector && !isSelf) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const {
      name,
      email,
      role,
      isActive,
      avatarUrl,
      department,
      discipline,
      designation,
      reportingManagerId,
      phone,
      joinDate,
      availabilityStatus
    } = req.body;

    // 1. Update User fields
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (avatarUrl) userFields.avatarUrl = avatarUrl;
    
    // Only Admin or PMO Director can change role / active status
    if (isAdminOrDirector) {
      if (role) userFields.role = role;
      if (isActive !== undefined) userFields.isActive = isActive;
    }

    await user.update(userFields, { transaction });

    // 2. Update Employee fields
    const employeeFields = {};
    if (department) employeeFields.department = department;
    if (discipline) employeeFields.discipline = discipline;
    if (designation) employeeFields.designation = designation;
    if (phone !== undefined) employeeFields.phone = phone;
    if (joinDate) employeeFields.joinDate = joinDate;
    if (availabilityStatus) employeeFields.availabilityStatus = availabilityStatus;
    
    // Only Admin or PMO Director can change reporting manager
    if (isAdminOrDirector && reportingManagerId !== undefined) {
      employeeFields.reportingManagerId = reportingManagerId || null;
    }

    await employee.update(employeeFields, { transaction });

    await transaction.commit();

    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'isActive', 'avatarUrl']
        },
        {
          model: Employee,
          as: 'reportingManager',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    res.json({ success: true, data: updatedEmployee });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete Employee (Admin or PMO Director only)
// @route   DELETE /api/employees/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin', 'PMO Director'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const user = await User.findByPk(employee.userId);
    
    // Delete Employee first, then User
    await employee.destroy({ transaction });
    if (user) {
      await user.destroy({ transaction });
    }

    await transaction.commit();
    res.json({ success: true, message: 'Employee record and user account removed successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
