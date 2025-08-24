// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// CRUD routes
router.get('/', protect, authController.getUsers);
router.get('/:id', protect, authController.getUser);
router.put('/me', protect, authController.updateMe);
router.put('/password', protect, authController.updatePassword);
router.put('/:id', protect, checkRole(['Admin', 'Manager']), authController.updateUser);
router.delete('/:id', protect, checkRole(['Admin', 'Manager']), authController.deleteUser);

module.exports = router;
