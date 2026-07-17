const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Milestone = sequelize.define('Milestone', {
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
  targetDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Upcoming', 'Achieved', 'Missed'),
    allowNull: false,
    defaultValue: 'Upcoming'
  }
});

module.exports = Milestone;
