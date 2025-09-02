// routes/notificationRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const controller = require('../controllers/notificationController');

const router = express.Router();

router.get('/', protect, controller.listMyNotifications);
router.put('/:id/seen', protect, controller.markSeen);
router.delete('/:id', protect, controller.deleteOne);
router.delete('/', protect, controller.deleteAll);
router.put('/seen/all', protect, controller.markAllSeen);

module.exports = router;
