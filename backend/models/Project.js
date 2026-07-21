const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  serviceCategory: {
    type: DataTypes.ENUM(
      'PipelineTransmission',
      'GatheringDistribution',
      'PumpValveTelemetry',
      'LeakDetectionSensors',
      'CathodicProtection',
      'RegulatoryCompliance',
      'Buildings',
      'UrbanPlanning',
      'HeatingCooling',
      'PowerTransmissionDistribution',
      'WaterTreatment',
      'WastewaterTreatment',
      'InteriorDesign',
      'Healthcare',
      'BIM'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  budgetSpent: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  currentPhase: {
    type: DataTypes.ENUM('Design', 'Approval', 'Execution', 'Handover', 'Completed'),
    allowNull: false,
    defaultValue: 'Design'
  },
  status: {
    type: DataTypes.ENUM('OnTrack', 'AtRisk', 'Delayed', 'Completed'),
    allowNull: false,
    defaultValue: 'OnTrack'
  },
  projectManagerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Project;
