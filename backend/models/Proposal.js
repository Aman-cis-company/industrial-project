const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Proposal = sequelize.define('Proposal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
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
  estimatedValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Sent', 'Negotiation', 'Won', 'Lost'),
    allowNull: false,
    defaultValue: 'Draft'
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  decisionDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
});

module.exports = Proposal;
