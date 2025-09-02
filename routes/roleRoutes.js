// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware');

// CRUD routes
router.post('/', protect, roleController.createRole);
router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRoleById);
router.put('/:id', protect, roleController.updateRole);
router.delete('/:id', protect, roleController.deleteRole);

module.exports = router;
