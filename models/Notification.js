// models/Notification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Notification = sequelize.define('Notification', {
  title: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: true },

  // high-level classification
  type: { 
    type: DataTypes.ENUM('user', 'task', 'role', 'system'),
    allowNull: false
  },

  // CRUD-ish action
  action: {
    type: DataTypes.ENUM('created', 'updated', 'deleted', 'registered', 'details_updated'),
    allowNull: false
  },

  // optional linkage to an entity
  entity_type: { type: DataTypes.STRING, allowNull: true }, // e.g. 'task', 'user', 'role'
  entity_id:   { type: DataTypes.INTEGER, allowNull: true },

  // seen + auto-delete policy
  seen_at: { type: DataTypes.DATE, allowNull: true },

  // free-form extra
  meta: { type: DataTypes.JSON, allowNull: true }
}, { timestamps: true });

Notification.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

module.exports = Notification;
