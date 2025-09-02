// controllers/notificationController.js
const Notification = require('../models/Notification');

exports.listMyNotifications = async (req, res) => {
  try {
    const items = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.markSeen = async (req, res) => {
  try {
    const n = await Notification.findByPk(req.params.id);
    if (!n || n.user_id !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (!n.seen_at) {
      n.seen_at = new Date();
      await n.save();
    }
    res.json({ message: 'Marked as seen', notification: n });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.markAllSeen = async (req, res) => {
  try {
    const now = new Date();
    const [count] = await Notification.update(
      { seen_at: now },
      { where: { user_id: req.user.id, seen_at: null } }
    );
    res.json({ message: 'All notifications marked as seen', updated: count });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


exports.deleteOne = async (req, res) => {
  try {
    const n = await Notification.findByPk(req.params.id);
    if (!n || n.user_id !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await n.destroy();
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const n = await Notification.findAll();
    
    await n.destroy();
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
