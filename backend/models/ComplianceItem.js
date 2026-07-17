const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ComplianceItem = sequelize.define('ComplianceItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  requirementName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  applicableServiceCategory: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'InProgress', 'Compliant', 'NonCompliant'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = ComplianceItem;
