const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PipelineAsset = sequelize.define('PipelineAsset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  segmentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assetType: {
    type: DataTypes.ENUM('Valve', 'Station', 'PumpUnit', 'Sensor'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  installDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  lastServiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Operational'
  }
});

module.exports = PipelineAsset;
