const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PipelineSegment = sequelize.define('PipelineSegment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false
  },
  segmentType: {
    type: DataTypes.ENUM('Transmission', 'Distribution', 'Gathering'),
    allowNull: false
  },
  material: {
    type: DataTypes.STRING,
    allowNull: false
  },
  diameterInches: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  designPressure: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  installDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Operational', 'UnderMaintenance', 'ShutDown', 'Critical'),
    allowNull: false,
    defaultValue: 'Operational'
  },
  latStart: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  lngStart: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  latEnd: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  lngEnd: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = PipelineSegment;
