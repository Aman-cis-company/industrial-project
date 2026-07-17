const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ApprovalStep = sequelize.define('ApprovalStep', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workflowId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stepOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  approverId: {
    type: DataTypes.INTEGER,
    allowNull: true // Can be assigned to a specific user
  },
  approverRole: {
    type: DataTypes.ENUM('Admin', 'PMO Director', 'Project Manager', 'Engineer'),
    allowNull: true // Or assigned to a specific role
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  actionedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = ApprovalStep;
