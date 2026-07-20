const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const IncidentReport = sequelize.define('IncidentReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  segmentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reportedById: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  severity: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Low'
  },
  status: {
    type: DataTypes.ENUM('Reported', 'UnderInvestigation', 'Resolved', 'Closed'),
    allowNull: false,
    defaultValue: 'Reported'
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  reportedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = IncidentReport;
