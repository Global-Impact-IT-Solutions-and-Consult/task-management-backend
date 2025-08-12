const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Task = sequelize.define('Task', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  due_date: { type: DataTypes.DATE },
  priority: { type: DataTypes.ENUM('High', 'Medium', 'Low') }
}, { timestamps: true });

Task.belongsTo(User, { as: 'assigned_to', foreignKey: 'assigned_to_id' });
Task.belongsTo(User, { as: 'created_by', foreignKey: 'created_by_id' });

module.exports = Task;
