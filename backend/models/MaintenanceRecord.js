const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MaintenanceRecord = sequelize.define('MaintenanceRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assetId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  segmentId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  technicianId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maintenanceType: {
    type: DataTypes.ENUM('Preventive', 'Corrective'),
    allowNull: false
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  completedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Completed', 'Overdue'),
    allowNull: false,
    defaultValue: 'Scheduled'
  },
  workPerformed: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nextDueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
});

module.exports = MaintenanceRecord;
