const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProjectTeamMember = sequelize.define('ProjectTeamMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  roleOnProject: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Technical Contributor'
  },
  allocationPercent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100
    }
  }
});

module.exports = ProjectTeamMember;
