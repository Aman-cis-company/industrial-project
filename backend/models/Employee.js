const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  discipline: {
    type: DataTypes.ENUM(
      'Civil',
      'MEP',
      'BIM',
      'WaterEnvironmental',
      'InteriorDesign',
      'HealthcarePlanning',
      'Piping',
      'Instrumentation',
      'Corrosion',
      'HSE'
    ),
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reportingManagerId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  joinDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  availabilityStatus: {
    type: DataTypes.ENUM('Available', 'Busy', 'OnLeave'),
    allowNull: false,
    defaultValue: 'Available'
  }
});

module.exports = Employee;
