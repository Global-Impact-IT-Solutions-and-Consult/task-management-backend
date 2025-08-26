const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Role = require('./Role');

const Task = sequelize.define('Task', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  start_date: { type: DataTypes.DATE },
  due_date: { type: DataTypes.DATE },
  priority: { type: DataTypes.ENUM('High', 'Medium', 'Low') },
  status: { type: DataTypes.ENUM('Todo', 'In Progress', 'Done'), defaultValue: 'Todo' },
  percentage_completed: { type: DataTypes.NUMBER, defaultValue: 0 },
}, { timestamps: true });

Task.belongsTo(User, { as: 'assigned_to', foreignKey: 'assigned_to_id' });
Task.belongsTo(User, { as: 'created_by', foreignKey: 'created_by_id' });
Task.belongsTo(Role, { as: 'role_nature', foreignKey: 'role_nature_id' });

module.exports = Task;
