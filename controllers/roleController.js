// controllers/roleController.js
const Role = require("../models/Role");
const { notifyRoles } = require('../services/notificationService');

exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;

    const role = await Role.create({ name });

    // Notify Managers about new role creation
    const io = req.app.get('io');
    await notifyRoles(io, ['Manager'], {
      title: 'Role created',
      body: `Role "${role.name}" was created by ${req.user?.name || 'system'}`,
      type: 'role',
      action: 'created',
      entity_type: 'role',
      entity_id: role.id
    }, { actorId: req.user.id });

    res.status(201).json({ message: 'Role created successfully', role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name } = req.body;

    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    role.name = name || role.name;
    await role.save();

    // Notify Managers about role update
    const io = req.app.get('io');
    await notifyRoles(io, ['Manager'], {
      title: 'Role updated',
      body: `Role "${role.name}" was updated by ${req.user?.name || 'system'}`,
      type: 'role',
      action: 'updated',
      entity_type: 'role',
      entity_id: role.id
    }, { actorId: req.user.id });

    res.status(200).json({ message: 'Role updated successfully', role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    await role.destroy();

    // Notify Managers about role deletion
    const io = req.app.get('io');
    await notifyRoles(io, ['Manager'], {
      title: 'Role deleted',
      body: `Role "${role.name}" was deleted by ${req.user?.name || 'system'}`,
      type: 'role',
      action: 'deleted',
      entity_type: 'role',
      entity_id: role.id
    }, { actorId: req.user.id });

    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
