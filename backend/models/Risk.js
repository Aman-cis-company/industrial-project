const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Risk = sequelize.define('Risk', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
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
  category: {
    type: DataTypes.ENUM('Technical', 'Financial', 'Regulatory', 'Schedule', 'Safety'),
    allowNull: false,
    defaultValue: 'Technical'
  },
  probability: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    validate: { min: 1, max: 5 }
  },
  impact: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    validate: { min: 1, max: 5 }
  },
  riskScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 9
  },
  status: {
    type: DataTypes.ENUM('Open', 'Mitigating', 'Closed'),
    allowNull: false,
    defaultValue: 'Open'
  },
  mitigationPlan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  identifiedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  hooks: {
    beforeSave: (risk) => {
      risk.riskScore = risk.probability * risk.impact;
    }
  }
});

module.exports = Risk;
