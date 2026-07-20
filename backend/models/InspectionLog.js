const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InspectionLog = sequelize.define('InspectionLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  segmentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  inspectorId: {
    type: DataTypes.INTEGER,
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
  checklistData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachmentUrls: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

module.exports = InspectionLog;
