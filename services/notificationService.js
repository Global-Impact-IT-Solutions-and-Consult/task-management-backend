// services/notificationService.js
const { Op } = require('sequelize');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Role = require('../models/Role');

function uniqNums(arr = []) {
  return Array.from(new Set(arr.map((x) => Number(x)).filter((x) => Number.isFinite(x))));
}

function buildExcludeIds(opts) {
  const list = [];
  if (opts?.excludeUserIds?.length) list.push(...opts.excludeUserIds);
  if (opts?.actorId != null) list.push(opts.actorId);
  return uniqNums(list);
}

async function getUserIdsByRoles(roleNames = []) {
  if (!roleNames.length) return [];
  const users = await User.findAll({
    include: [{ model: Role, as: 'role', where: { name: roleNames } }],
    attributes: ['id']
  });
  return users.map(u => Number(u.id)).filter(Boolean);
}

async function createAndEmitToUsers(io, userIds, payload, opts = {}) {
  const exclude = new Set(buildExcludeIds(opts));
  const finalIds = uniqNums(userIds).filter(id => !exclude.has(id));
  if (!finalIds.length) return [];

  // bulk insert for efficiency
  const rows = finalIds.map(id => ({ user_id: id, ...payload }));
  const created = await Notification.bulkCreate(rows, { returning: true });

  // emit to personal rooms
  for (const n of created) {
    io.to(`user:${n.user_id}`).emit('notification:new', n.toJSON());
  }
  return created;
}

async function notifyRoles(io, roleNames, payload, opts = {}) {
  const ids = await getUserIdsByRoles(roleNames);
  return createAndEmitToUsers(io, ids, payload, opts);
}

async function notifyUser(io, userId, payload, opts = {}) {
  const exclude = new Set(buildExcludeIds(opts));
  if (exclude.has(Number(userId))) return null; // skip actor/self
  return createAndEmitToUsers(io, [userId], payload, opts);
}

// Auto-delete any notification seen > 1 hour ago
async function deleteSeenOlderThanOneHour() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  await Notification.destroy({
    where: { seen_at: { [Op.lt]: oneHourAgo } }
  });
}

module.exports = {
  notifyRoles,
  notifyUser,
  deleteSeenOlderThanOneHour
};
